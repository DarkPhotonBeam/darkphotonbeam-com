import Menu from "../Menu/Menu";
import styles from './Layout.module.scss';

export default function Layout({ children }) {
    return (
        <>
            <Menu />
            <main className={styles.main}>
                {children}
            </main>
        </>
    );
}