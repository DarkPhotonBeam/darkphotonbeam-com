import {useRecoilState} from "recoil";
import {useRouter} from "next/router";
import styles from "./Menu.module.scss";
import Hamburger from "hamburger-react";
import Link from "next/link";
import {isInteractingState} from '../../lib/atoms';
import {useState} from "react";
import routes from '../../public/json/routes.json';


export default function Menu() {
    const [open, setOpen] = useState(false);
    const [isInteracting, setIsInteracting] = useRecoilState(isInteractingState)



    return (
        <>
            <div onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)} className={styles.hamburger}>
                <Hamburger toggled={open} toggle={setOpen} />
            </div>
            <aside onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)} className={styles.menu + ' ' + (open ? styles.menuOpen : '')}>
                <ul>
                    {
                        routes.map((route, i) => <MenuLink key={i} name={route.name} path={route.path} />)
                    }
                </ul>
            </aside>
        </>
    );
}

function MenuLink({name, path}) {
    const router = useRouter()

    return (
        <li className={router.pathname === path ? styles.active : ''}><Link href={path}>{name}</Link></li>
    );
}