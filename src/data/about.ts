import peopleImg from '@/assets/home/people.png'
import logoImg from '@/assets/home/logo1.png'

export const aboutStats = [
  { id: 1, value: '', label: '' },
  { id: 2, value: '', label: '' },
  { id: 3, value: '3', label: 'Developers behind the project' },
]

export const aboutValues = [
  {
    id: 1,
    title: 'Frontend Architecture',
    description: 'Pages, services, data, utilities, and reusable components are separated so the project stays easy to maintain.',
  },
  {
    id: 2,
    title: 'User Experience',
    description: 'The team built complete shopping flows including browse, product detail, wishlist, checkout, invoice, and profile pages.',
  },
  {
    id: 3,
    title: 'Backend Ready',
    description: 'Mock/local data is kept behind service functions so real API endpoints can be connected later without changing page layouts.',
  },
]

export const teamMembers = [
  {
    id: 1,
    name: '',
    role: '',
    image: peopleImg,
  },
  {
    id: 2,
    name: '',
    role: 'r',
    image: peopleImg,
  },
  {
    id: 3,
    name: '',
    role: '',
    image: peopleImg,
  },
]

export const aboutImages = [logoImg, peopleImg]
