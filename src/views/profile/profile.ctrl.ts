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

    function displayTitleOnTap(this: HTMLElement, event: TouchEvent) {
        if (this.title) {
          const titleDisplay = document.createElement('div');
          titleDisplay.textContent = this.title;
          titleDisplay.style.position = 'absolute';
    
          const rect = this.getBoundingClientRect();
          titleDisplay.style.left = (event.touches[0].clientX - (titleDisplay.offsetWidth / 2)) + 'px';
          titleDisplay.style.top = (rect.bottom + 5) + 'px';
    
          titleDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          titleDisplay.style.color = 'white';
          titleDisplay.style.padding = '5px';
          titleDisplay.style.borderRadius = '3px';
          titleDisplay.style.zIndex = '1000';
          document.body.appendChild(titleDisplay);

          setTimeout(function() {
            if (document.body.contains(titleDisplay)) {
              document.body.removeChild(titleDisplay);
            }
          }, 3000);
        }
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

        profilePicture.addEventListener('touchstart', displayTitleOnTap);
        profileUsername.addEventListener('touchstart', displayTitleOnTap);
    }
    const deactivateEditMode = () => {
        profileName.textContent = firstNameInput.value + ' ' + lastNameInput.value;
        profileEmail.textContent = emailInput.value;
        profileAge.textContent = ageInput.value + ' years old';
        firstNameInput.remove();
        lastNameInput.remove();
        emailInput.remove();
        ageInput.remove();

        profilePicture.removeEventListener('touchstart', displayTitleOnTap);
        profileUsername.removeEventListener('touchstart', displayTitleOnTap);
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
            console.error('Please fill in your name and email address.');
        }
    }

    if (editButton)
        editButton.onclick = () => {
            activateEditMode();
            editButton.textContent = 'Save Profile';
            editButton.onclick = updateProfile;
        };
}