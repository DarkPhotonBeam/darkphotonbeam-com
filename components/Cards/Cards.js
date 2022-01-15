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
            <h2 className={styles.title}>{title}</h2>
            <h3 className={styles.subtitle}>{subtitle}</h3>
            <p className={styles.description}>{description}</p>
            {
                sections.map((s, i) => (
                    <div key={i} className={styles.section}>
                        {
                            s.title ? <h3 className={styles.sectionTitle}>{s.title}</h3> : ''
                        }
                        <p className={styles.sectionDescription}>{s.description}</p>
                    </div>
                ))
            }
        </a>
    );
}

export { Cards, Card };