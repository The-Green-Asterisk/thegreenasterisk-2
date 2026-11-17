import el from '@elements';
import { getData, putData } from '@services/request';
import { renderUserLinks } from '@views/links/userLinks';
import User from '../../entities/User';

export default function profile(query: { [key: string]: any }) {
    el.title.textContent = 'Profile';
    const editButton = el.buttons?.id('edit-profile');
    if (!el.currentUser) {
        editButton?.remove();
    }
    let profileName = el.paragraphs?.id('profile-name');
    let profileEmail = el.paragraphs?.id('profile-email');
    let profileUsername = el.paragraphs?.id('profile-username');
    let profilePicture = el.imgs?.id('profile-picture') as HTMLImageElement;
    let profileAge = el.paragraphs?.id('profile-age');

    if (!profileName || !profileEmail || !profileUsername || !profilePicture || !profileAge) {
        console.error('Failed to load profile data.');
        return;
    }

    const firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.placeholder = 'First Name';
    firstNameInput.name = 'firstName';
    const lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.placeholder = 'Last Name';
    lastNameInput.name = 'lastName';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email';
    emailInput.name = 'email';
    emailInput.autocomplete = 'email';
    const ageInput = document.createElement('input');
    ageInput.type = 'number';
    ageInput.placeholder = 'Age';
    ageInput.name = 'age';
    ageInput.min = '0';
    ageInput.max = '120';

    getData<User>('/profile', { id: query.id ?? el.currentUser?.id ?? 0 })
        .then((response) => {
            if (response) {
                if (response.firstName && response.firstName !== '') {
                    el.title.textContent = `${response.firstName}'s Profile`;
                }
                if (el.currentUser?.id !== response.id) {
                    editButton?.remove();
                }
                profileName.textContent = response.firstName + ' ' + response.lastName;
                profileEmail.textContent = response.email ?? '';
                profileUsername.textContent = response.username;
                profilePicture.src = response.profilePicture;
                profileAge.textContent = (response.age?.toString() ?? 'unknown') + ' years old';

                firstNameInput.value = response.firstName;
                lastNameInput.value = response.lastName;
                emailInput.value = response.email ?? '';
                ageInput.value = response.age?.toString() ?? '';

                if (profileName.textContent === '' && editButton) {
                    activateEditMode();
                    editButton.textContent = 'Save Profile';
                    editButton.addEventListener('click', updateProfile, { signal: el.signal });
                }

                const profileLinksSection = el.profile?.querySelector<HTMLElement>('#profile-links-section');
                const profileLinksMeta = profileLinksSection?.querySelector<HTMLElement>('#profile-links-meta');
                const profileLinksList = profileLinksSection?.querySelector<HTMLElement>('#profile-links-list');
                const profileLinksPage = profileLinksSection?.querySelector<HTMLAnchorElement>('#profile-links-page');
                if (profileLinksPage && response.username) {
                    profileLinksPage.href = `/links?username=${encodeURIComponent(response.username)}`;
                }
                const canEditLinks = Boolean(
                    el.isAuth && el.currentUser && (el.currentUser.isAdmin || el.currentUser.id === response.id)
                );
                if (profileLinksMeta) {
                    renderLinksHeaderEditor(profileLinksMeta, response, canEditLinks);
                }
                if (profileLinksList) {
                    renderUserLinks({
                        container: profileLinksList,
                        userId: response.id,
                        canEdit: canEditLinks,
                        emptyText: 'No links added yet.'
                    }).catch((err) => {
                        console.error(err ?? 'Failed to load user links.');
                    });
                }
            } else {
                throw new Error('No user returned');
            }
        })
        .catch((error) => {
            console.error(error ?? 'An error occurred while loading profile data.');
        });

    const activateEditMode = () => {
        profileName.textContent = '';
        profileName.appendChild(firstNameInput);
        profileName.appendChild(lastNameInput);
        profileEmail.textContent = '';
        profileEmail.appendChild(emailInput);
        profileAge.textContent = '';
        profileAge.appendChild(ageInput);
    }
    const deactivateEditMode = () => {
        profileName.textContent = firstNameInput.value + ' ' + lastNameInput.value;
        profileEmail.textContent = emailInput.value;
        profileAge.textContent = ageInput.value + ' years old';
        firstNameInput.remove();
        lastNameInput.remove();
        emailInput.remove();
        ageInput.remove();
    }
    const updateProfile = () => {
        const user = new User();
        user.firstName = firstNameInput.value.stripScripts();
        user.lastName = lastNameInput.value.stripScripts();
        user.email = emailInput.value.stripScripts();
        user.age = Number(ageInput.value);
        user.id = el.currentUser?.id ?? 0;

        if (user.firstName && user.lastName && user.email) {
            putData<User>('/update-profile', user)
                .then((response) => {
                    if (response && editButton) {
                        firstNameInput.value = response.firstName;
                        lastNameInput.value = response.lastName;
                        emailInput.value = response.email ?? '';
                        ageInput.value = response.age?.toString() ?? '';
                        deactivateEditMode();
                        editButton.textContent = 'Edit Profile';
                        editButton.addEventListener('click', () => {
                            activateEditMode();
                            editButton.textContent = 'Save Profile';
                            editButton.addEventListener('click', updateProfile, { signal: el.signal });
                        }, { signal: el.signal });
                    } else {
                        throw new Error('Failed to update profile');
                    }
                })
                .catch((error) => {
                    console.error(error ?? 'An error occurred while updating profile data.');
                });
        } else {
            console.error('Please fill in your name and email address.');
        }
    }

    if (editButton)
        editButton.addEventListener('click', () => {
            activateEditMode();
            editButton.textContent = 'Save Profile';
            editButton.addEventListener('click', updateProfile, { signal: el.signal });
        }, { signal: el.signal });
}

function renderLinksHeaderEditor(container: HTMLElement, user: User, canEdit: boolean) {
    const defaultTitle = `${user.firstName || user.username}'s Links`;
    const renderDisplay = () => {
        container.innerHTML = '';
        const titleEl = document.createElement('p');
        titleEl.className = 'profile-links-title-preview';
        titleEl.textContent = user.linksTitle?.trim() || defaultTitle;
        container.appendChild(titleEl);

        if (user.linksDescription?.trim()) {
            const descEl = document.createElement('p');
            descEl.className = 'profile-links-desc-preview';
            descEl.textContent = user.linksDescription.trim();
            container.appendChild(descEl);
        }

        if (canEdit) {
            const editHeaderBtn = document.createElement('button');
            editHeaderBtn.type = 'button';
            editHeaderBtn.className = 'profile-links-edit-header';
            editHeaderBtn.textContent = 'Edit Page Title & Description';
            editHeaderBtn.addEventListener('click', renderForm, { signal: el.signal });
            container.appendChild(editHeaderBtn);
        }
    };

    const renderForm = () => {
        container.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'profile-links-meta-form';

        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Links Page Title';
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.maxLength = 255;
        titleInput.placeholder = defaultTitle;
        titleInput.value = user.linksTitle ?? '';
        titleLabel.appendChild(titleInput);

        const descLabel = document.createElement('label');
        descLabel.textContent = 'Links Page Description';
        const descInput = document.createElement('textarea');
        descInput.rows = 3;
        descInput.placeholder = 'Optional intro text shown on your links page';
        descInput.value = user.linksDescription ?? '';
        descLabel.appendChild(descInput);

        const actions = document.createElement('div');
        actions.className = 'profile-links-meta-actions';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Save';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', renderDisplay, { signal: el.signal });

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);

        form.appendChild(titleLabel);
        form.appendChild(descLabel);
        form.appendChild(actions);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveBtn.disabled = true;
            try {
                const updated = await putData<User>('/update-profile', {
                    id: user.id,
                    linksTitle: titleInput.value.stripScripts().trim(),
                    linksDescription: descInput.value.stripScripts().trim(),
                });
                if (updated) {
                    user.linksTitle = updated.linksTitle;
                    user.linksDescription = updated.linksDescription;
                }
                renderDisplay();
            } catch (err) {
                console.error(err ?? 'Failed to update links header.');
                saveBtn.disabled = false;
            }
        }, { signal: el.signal });

        container.appendChild(form);
    };

    renderDisplay();
}