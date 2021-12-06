import artists from '../public/json/listen.json';
import {SiApplemusic, SiBandcamp, SiSpotify, SiYoutube, SiYoutubemusic} from "react-icons/si";

function getIcon(storeName) {
    switch (storeName) {
        case 'Spotify':
            return <SiSpotify/>;
        case 'Apple Music':
            return <SiApplemusic/>;
        case 'Bandcamp':
            return <SiBandcamp />;
        case 'YouTube Music':
            return <SiYoutubemusic />;
        case 'YouTube':
            return <SiYoutube />;
        default:
            return '';
    }
}

export default function Listen() {
    return (
        <div>
            <h1>Listen To My Music</h1>
            {
                artists.map((artist, i) => <Artist key={i} artist={artist}/>)
            }
        </div>
    );
}

function Artist({artist}) {
    return (
        <div>
            <h2>{artist.artist}</h2>
            <ul>
                {
                    artist.stores.map((store, i) => <Link key={i} store={store}/>)
                }
            </ul>
        </div>
    );
}

function Link({store}) {
    return (
        <li>
            <a target={'_blank'} href={store.url}>{getIcon(store.name)} {store.name}</a>
        </li>
    );
}