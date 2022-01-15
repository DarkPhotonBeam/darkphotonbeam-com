import styles from './Cards.module.scss';

function Cards({children}) {
    return (
        <div className={styles.cards}>
            {children}
        </div>
    );
}

function Card({title, subtitle, description, sections, href}) {
    return (
        <a className={styles.card} href={href} rel={'noreferrer'}>
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
            <p>{description}</p>
            {
                sections.map((s, i) => (
                    <div key={i} className={styles.section}>
                        {
                            s.title ? <h3>{s.title}</h3> : ''
                        }
                        <p>{s.description}</p>
                    </div>
                ))
            }
        </a>
    );
}

export { Cards, Card };