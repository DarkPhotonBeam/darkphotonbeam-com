import {useRecoilState} from "recoil";
import {useRouter} from "next/router";
import styles from "./Menu.module.scss";
import Hamburger from "hamburger-react";
import Link from "next/link";
import {isInteractingState} from '../../lib/atoms';
import {useState} from "react";


export default function Menu() {
    const [open, setOpen] = useState(false);
    const [isInteracting, setIsInteracting] = useRecoilState(isInteractingState)

    const router = useRouter()

    return (
        <>
            <div onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)} className={styles.hamburger}>
                <Hamburger toggled={open} toggle={setOpen} />
            </div>
            <aside onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)} className={styles.menu + ' ' + (open ? styles.menuOpen : '')}>
                <ul>
                    <li className={router.pathname === '/' ? styles.active : ''}><Link href={'/'}>Home</Link></li>
                    <li><Link href={'/listen'}>Listen</Link></li>
                    <li>Dan Photon</li>
                    <li>Services</li>
                    <li>Contact</li>
                </ul>
            </aside>
        </>
    );
}