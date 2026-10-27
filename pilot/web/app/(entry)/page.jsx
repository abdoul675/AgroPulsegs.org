import {redirect} from 'next/navigation';
export default function Home(){redirect(`/fr/expertise/${process.env.PILOT_DOCUMENT_ID}`);}
