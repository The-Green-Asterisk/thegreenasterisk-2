import el from '@elements';
import { get, put } from '@services/request';
import User from '../../entities/User';

export default function profile(query: {[key:string]: any}) {
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
    const lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.placeholder = 'Last Name';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email';
    const ageInput = document.createElement('input');
    ageInput.type = 'number';
    ageInput.placeholder = 'Age';
    ageInput.min = '0';
    ageInput.max = '120';

    get<User>('/data/profile', {id: query.id ?? el.currentUser?.id ?? 0})
        .then((response) => {
            if (response) {
                if (response.firstName && response.firstName !== '') {
                    el.title.textContent = `${response.firstName}'s Profile`;
                }
                if (el.currentUser?.id !== response.id) {
                    editButton?.remove();
                }
                profileName.textContent = response.firstName + ' ' + response.lastName;
                profileEmail.textContent = response.email;
                profileUsername.textContent = response.username;
                profilePicture.src = response.profilePicture;
                profileAge.textContent = response.age.toString() + ' years old';

                firstNameInput.value = response.firstName;
                lastNameInput.value = response.lastName;
                emailInput.value = response.email;
                ageInput.value = response.age.toString();

                if (profileName.textContent === '' && editButton) {
                    activateEditMode();
                    editButton.textContent = 'Save Profile';
                    editButton.onclick = updateProfile;
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
        user.firstName = firstNameInput.value;
        user.lastName = lastNameInput.value;
        user.email = emailInput.value;
        user.age = Number(ageInput.value);
        user.id = el.currentUser?.id ?? 0;

        if (user.firstName && user.lastName && user.email) {
            put('/data/update-profile', user)
                .then((response) => {
                    if (response && editButton) {
                        profileName.textContent = user.firstName + ' ' + user.lastName;
                        deactivateEditMode();
                        editButton.textContent = 'Edit Profile';
                        editButton.onclick = () => {
                            activateEditMode();
                            editButton.textContent = 'Save Profile';
                            editButton.onclick = updateProfile;
                        }
                    } else {
                        throw new Error('Failed to update profile');
                    }
                })
                .catch((error) => {
                    console.error(error ?? 'An error occurred while updating profile data.');
                });
        } else {
            console.error('Please fill in both fields.');
        }
    }

    if (editButton)
        editButton.onclick = () => {
            activateEditMode();
            editButton.textContent = 'Save Profile';
            editButton.onclick = updateProfile;
        };
}