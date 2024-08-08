interface UserProps {
  name: string;
  email: string;
  avatar: string;
  thumb: string;
  role: string;
}

export default function useUser() {
  const email = 'jonedoe@gmail.com';
  const name = 'Jone Doe';

  const image = '/assets/images/users/avatar-1.png';
  const thumb = '/assets/images/users/avatar-thumb-1.png';

  const newUser: UserProps = {
    name: name,
    email: email,
    avatar: image,
    thumb,
    role: 'UI/UX Designer'
  };

  return newUser;
}
