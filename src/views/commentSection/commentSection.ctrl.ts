import el, { html } from "@elements";
import { Comment } from "@entities";
import { del, get, post, put } from "@services/request";
import textEditor from "@views/textEditor/textEditor.ctrl";
import { CommentModel } from "../../entities/Comment";

const noCommentsMsg = html`<p>No comments yet</p>`;

export default async function commentSection(commentableType: string, commentableId: number) {
    const section = el.sections.id('comment-section');

    if (!section) {
        throw new Error('Comment section element not found');
    }

    section.style.display = 'flex';

    const existingCommentSection = section.querySelector('#text-editor-content-new-comment');
    const commentNum = section.querySelectorAll('.comment').length;

    if (existingCommentSection || commentNum > 0) {
        section.innerHTML = '';
    }

    const commentsHeader = html`<h2>Comments</h2>`;
    section.appendChild(commentsHeader);

    const comments = await get<Comment[]>('/data/get-comments', { commentableType, commentableId });
    if (comments?.length > 0) {
        comments.forEach(comment => {
            section.appendChild(buildComment(comment));
        });
    } else {
        section.appendChild(noCommentsMsg);
    };

    if (el.currentUser) {
        section.appendChild(textEditor('new-comment'));
        const submitSection = html`
            <div id="submit-comment-section">
                <img src="${el.currentUser.profilePicture}" title="Commenting as ${el.currentUser.username}" class="comment-author-avatar"/>
            </div>
        `;
        section.appendChild(submitSection);

        const newCommentButton = html`<button id="submit-comment-btn">Submit Comment</button>`;
        newCommentButton.onclick = async () => {
            const commentContentDiv = el.divs.id('text-editor-content-new-comment');
            const content = commentContentDiv.innerHTML.trim();
            if (content.length === 0) {
                alert('Comment content cannot be empty.');
                return;
            }
            const newComment = new CommentModel();
            newComment.content = content;
            newComment.commentableType = commentableType;
            newComment.commentableId = commentableId;
            newComment.authorId = el.currentUser!.id;

            const savedCommment = await post<Comment>('/data/add-comment', newComment);
            noCommentsMsg.remove();
            commentContentDiv.innerHTML = '';
            el.textEditor?.insertAdjacentElement('beforebegin',buildComment(savedCommment));
        };

        submitSection.appendChild(newCommentButton);
        section.appendChild(submitSection);
    } else {
        const loginPrompt = html`<p>Log in to post comments.</p>`;
        section.appendChild(loginPrompt);
    }

    return section;
}

const buildComment = (comment: Comment) => {
    const commentElement = html`
        <div class="comment">
            <div class="comment-content">
                <img src="${comment.author.profilePicture}" alt="Avatar" class="comment-author-avatar"/>
                <div>${comment.content}</div>
                <span style="flex-grow:1"></span>
                <span class="fa fa-pencil" title="Edit Comment" style="cursor:pointer;"></span>
                <span class="fa fa-times delete-comment-button" title="Delete Comment" style="cursor:pointer;"></span>
            </div>
            <small>${comment.author.firstName} ${comment.author.lastName} (${comment.author.username}) on ${new Date(comment.createdAt).toLocaleString()}</small>
        </div>
    `;

    const deleteButton = commentElement.querySelector('.delete-comment-button') as HTMLSpanElement;
    const editButton = commentElement.querySelector('.fa-pencil') as HTMLSpanElement;

    if (el.currentUser?.isAdmin || el.currentUser?.id === comment.author.id) {
        deleteButton.style.display = 'inline';
        deleteButton.onclick = async () => {
            if (confirm('Are you sure you want to delete this comment?')) {
                await del('/data/delete-comment', { commentId: comment.id });
                commentElement.remove();

                const commentNum = el.sections.id('comment-section')?.querySelectorAll('.comment').length || 0;
                if (commentNum === 0) {
                    el.sections.id('comment-section')?.querySelector('h2')?.insertAdjacentElement("afterend", noCommentsMsg);
                }
            }
        };

        editButton.style.display = 'inline';
        editButton.onclick = () => {
            const contentDiv = commentElement.querySelector('p') as HTMLDivElement;
            const originalContent = contentDiv.innerHTML;
            const newContent = prompt('Edit your comment:', originalContent);
            if (newContent !== null && newContent.trim() !== '' && newContent !== originalContent) {
                const updatedComment = new CommentModel();
                updatedComment.id = comment.id;
                updatedComment.content = newContent;
                put<Comment>('/data/edit-comment', updatedComment).then((res) => {
                    contentDiv.innerHTML = res.content;
                }).catch(error => {
                    alert('Error updating comment: ' + error.message);
                });
            }
        };
    } else {
        deleteButton.style.display = 'none';
        editButton.style.display = 'none';
    }

    return commentElement;
}