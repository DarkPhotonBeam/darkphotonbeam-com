import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import {Canvas, useFrame} from '@react-three/fiber'
import {useEffect, useRef, useState} from "react"
import {
    Bloom,
    ChromaticAberration,
    DepthOfField, DotScreen,
    EffectComposer,
    Glitch,
    Noise, Scanline,
    Vignette
} from "@react-three/postprocessing";
import {BlendFunction} from "postprocessing";
import {MdPause, MdPlayArrow, MdSkipNext, MdSkipPrevious} from "react-icons/md";
//import song from '../public/audio/song.mp3'
import Hamburger from 'hamburger-react';
import {useRouter} from "next/router";
import {atom, useRecoilState} from "recoil";


const playlist = [
    '/audio/executeVersion02.mp3',
    '/audio/buildVersion01.mp3',
    '/audio/circlesVersion02.mp3',
    '/audio/dawn.mp3',
    '/audio/goodMorningGoodNight.mp3',
    '/audio/woodsVersion01.mp3',
    '/audio/projectEuroMirVersion03.mp3',
];

const barOpacity = 0.3;

const ecoMode = false;

const euler = 2.71828182846;

const isInteractingState = atom({
    key: 'isInteractingState',
    default: false,
});

function getIndex() {
    return localStorage.getItem('audioIndex') !== null ? parseInt(localStorage.getItem('audioIndex')) : 0;
}

// Limiter function
function lim(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

// Threshold function
function thres(value, threshold) {
    return value > threshold ? value - threshold : 0;
}

export default function Home() {
    const [audioData, setAudioData] = useState(null);
    const [meshScale, setMeshScale] = useState(1);
    const [meshColor, setMeshColor] = useState([255, 255, 255]);
    const [audioFile, setAudioFile] = useState(null);
    const [frequencyData, setFrequencyData] = useState([]);

    const [bassBias, setBassBias] = useState(.8);
    const [midBias, setMidBias] = useState(1);
    const [trebleBias, setTrebleBias] = useState(1.2);
    const [volumeAvg, setVolumeAvg] = useState(0);
    const [biasedVolumeAvg, setBiasedVolumeAvg] = useState(0);

    const [bass, setBass] = useState(127);
    const [mid, setMid] = useState(127);
    const [treble, setTreble] = useState(127);

    const [showMenu, setShowMenu] = useState(false);
    const [currentMenuInterval, setCurrentMenuInterval] = useState(null);

    const [isInteracting, setIsInteracting] = useRecoilState(isInteractingState);

    //const [progress, setProgress] = useState();

    const playTrack = index => {
        localStorage.setItem('audioIndex', index);
        audioFile.src = playlist[index];
        audioFile.play();
    };

    const playNextTrack = () => {
        const index = getIndex();
        const nextIndex = index + 1 >= playlist.length ? 0 : index + 1;
        playTrack(nextIndex);
    };

    const playPreviousTrack = () => {
        const index = getIndex();
        const nextIndex = index - 1 < 0 ? playlist.length - 1 : index - 1;
        playTrack(nextIndex);
    };

    const initAudio = () => {
        const index = getIndex();
        const soundFile = playlist[index];
        const _audioFile = new Audio(soundFile)
        const currentTime = localStorage.getItem('audioCurrentTime');
        if (currentTime !== null) _audioFile.currentTime = parseFloat(currentTime);
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(_audioFile);
        const analyser = audioContext.createAnalyser();
        _audioFile.src = soundFile;
        _audioFile.volume = 1;
        analyser.fftSize = 64
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.65; // DEFAULT: 0.8
        source.connect(audioContext.destination);
        source.connect(analyser);
        _audioFile.play().then(() => {
            //console.log(analyser);
            setAudioData(analyser)
        })
        setAudioFile(_audioFile)

        //console.log(audioData.fftSize);
    };

    const getFrequencyData = () => {
        //console.log(audioData);
        const bufferLength = audioData.frequencyBinCount;
        const amplitudeArray = new Uint8Array(bufferLength);
        audioData.getByteFrequencyData(amplitudeArray)
        return amplitudeArray;
        //styleAdjuster(amplitudeArray)
    };

    const getBandAverage = (_frequencyData, start, end) => {
        let sum = 0;
        //console.log(_frequencyData);
        for (let i = start; i < end; i++) {
            //sum += _frequencyData[i] === 0 || audioFile === undefined ? 0 : _frequencyData[i] * (1 / audioFile.volume);
            sum += _frequencyData[i];
        }
        return sum / (end - start);
    };

    const animate = () => {
        if (audioFile.ended) {
            playNextTrack();
        }

        const freqData = getFrequencyData();
        setFrequencyData(Array.from(freqData));
        const _bassBias = bassBias;
        const _midBias = midBias;
        const _trebleBias = trebleBias;

        //console.log(`_bass bias: ${_bassBias} _mid bias: ${midBias} _treble bias: ${trebleBias}`);

        const bassAvg = getBandAverage(freqData, 0, 1);
        const midAvg = getBandAverage(freqData, 2, 5);
        const trebleAvg = getBandAverage(freqData, 6, 31);
        const _volumeAvg = (bassAvg + midAvg + trebleAvg) / 3;
        setVolumeAvg(_volumeAvg * _volumeAvg / 255);

        const _bass = (bassAvg*bassAvg) / 255 * _bassBias;
        const _mid = (midAvg*midAvg) / 255 * _midBias;
        const _treble = (trebleAvg*trebleAvg) / 255 * _trebleBias;

        if (!ecoMode) {
            setBass(_bass);
            setMid(_mid);
            setTreble(_treble);
        }

        // const _bass = bassAvg * _bassBias;
        // const _mid = midAvg * _midBias;
        // const _treble = trebleAvg * _trebleBias;

        const scaleOffset = 1;
        const scaleMultiplier = lim(window.innerWidth/window.innerHeight * 15, 15, 30);

        const colorOffset = 40;
        const colorMultiplier = 1;
        //console.log(`_bass: ${_bass} _mid: ${_mid} _treble: ${_treble}`);

        const _biasedVolumeAvg = (_bass + _mid + _treble) / (255 * (_bassBias + _midBias + _trebleBias));
        setBiasedVolumeAvg(_biasedVolumeAvg);

        setMeshScale(scaleOffset + (_biasedVolumeAvg * scaleMultiplier));
        setMeshColor([
            colorOffset + parseInt(_bass * colorMultiplier - colorOffset),
            colorOffset + parseInt(_treble * colorMultiplier - colorOffset),
            colorOffset + parseInt(_mid * colorMultiplier - colorOffset),
        ]);
        localStorage.setItem('audioCurrentTime', audioFile.currentTime.toString());

        //setTimeout(() => requestAnimationFrame(animate), 10);
        requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (audioData !== null) {
            console.log('START');

            window.addEventListener('keypress', e => {
                switch (e.key) {
                    case ' ':
                        e.preventDefault();
                        if (audioFile.paused) {
                            audioFile.play();
                        } else {
                            audioFile.pause();
                        }
                        break;
                    case 'a':
                        e.preventDefault();
                        playPreviousTrack();
                        break;
                    case 'd':
                        e.preventDefault();
                        playNextTrack();
                        break;
                }
            })

            requestAnimationFrame(animate);
        }
    }, [audioData])

    let _biasedBarOpacity;
    let _barSpacing;
    let _barOffset;
    let _barGirth;
    if (ecoMode) {
        _biasedBarOpacity = barOpacity;
        _barSpacing = 3;
        _barOffset = 0;
        _barGirth = 0.5;
    } else {
        _biasedBarOpacity = barOpacity + treble / 255 * (1 - barOpacity);
        _barSpacing = (6 * (bass / 255));
        _barOffset = (biasedVolumeAvg * 40);
        _barGirth = (biasedVolumeAvg) * 2;
    }
    const biasedBarOpacity = _biasedBarOpacity;
    const barSpacing = _barSpacing;
    const barOffset = _barOffset;
    const barGirth = _barGirth;
    const abberationThreshold = .3;
    const abberationMultiplier = 0.02;

    const ref = useRef(null);

    const getContainerRatio = () => {
        return ref.current !== null ? ref.current.offsetHeight / ref.current.offsetWidth : .5;
    };

    return (
        <div ref={ref} className={styles.container} style={{cursor: showMenu ? 'initial' : 'none'}} onMouseMove={e => {
            setShowMenu(true);
            if (currentMenuInterval !== null) clearInterval(currentMenuInterval);
            if (!isInteracting) {
                const interval = setInterval(() => {
                    setShowMenu(false);
                }, 2000);
                setCurrentMenuInterval(interval);
            }
        }}>
            <Head>
                <title>Dark Photon</title>
                <meta name="description" content="Official Website of Dark Photon / Dan Photon"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <Canvas>
                <ambientLight color={'#ffffff'}/>
                <pointLight position={[10, 10, 10]}/>
                {
                    frequencyData.map((amp, i) => (
                        <Bar key={i} girth={barGirth} position={[(-(i-6) * barSpacing) - barSpacing * .5, 0, -40 - barOffset]} height={amp / 255 * 64} color={`rgb(${parseInt(meshColor[0] * biasedBarOpacity)}, ${parseInt(meshColor[1]* biasedBarOpacity)}, ${parseInt(meshColor[2]* biasedBarOpacity)})`} />
                    )).slice(-30, 30).reverse()
                }
                {
                    frequencyData.map((amp, i) => (
                        <Bar key={i} girth={barGirth} position={[((i-6) * barSpacing) + barSpacing * .5, 0, -40 - barOffset]} height={amp / 255 * 64} color={`rgb(${parseInt(meshColor[0] * biasedBarOpacity)}, ${parseInt(meshColor[1]* biasedBarOpacity)}, ${parseInt(meshColor[2]* biasedBarOpacity)})`} />
                    )).slice(-30, 30)
                }
                <Box rotationSpeed={volumeAvg * .007} color={`rgb(${meshColor[0]}, ${meshColor[1]}, ${meshColor[2]})`} scale={meshScale} position={[0, 0, -20]}/>
                {
                    !ecoMode ? (
                        <EffectComposer>
                            {/*<DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />*/}
                            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[thres(biasedVolumeAvg, abberationThreshold) * abberationMultiplier, thres(biasedVolumeAvg, abberationThreshold) * abberationMultiplier]} />
                            <Bloom luminanceThreshold={0.2} luminanceSmoothing={.5} height={50} />
                            <Scanline blendFunction={BlendFunction.OVERLAY} opacity={biasedVolumeAvg} density={2 * getContainerRatio()} />
                            <Noise opacity={0.05} />
                        </EffectComposer>
                    ) : ''
                }
            </Canvas>

            {
                audioFile && showMenu ? (
                    <div onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)} className={styles.controls}>
                        <div className={styles.buttons}>
                            <MdSkipPrevious className={styles.icon} onClick={playPreviousTrack} />
                            {audioFile?.paused ? <MdPlayArrow className={styles.icon} onClick={() => audioFile.play()}/> : <MdPause className={styles.icon} onClick={() => audioFile.pause()}/>}
                            <MdSkipNext className={styles.icon} onClick={playNextTrack} />
                        </div>
                        <div className={styles.progress}>
                            <div className={styles.progressBar}>
                                <div className={styles.track}>
                                    <div className={styles.trackProgress} style={{width: `${audioFile.currentTime / audioFile.duration * 100}%`}}/>
                                </div>
                                <input className={styles.progressBarInput} type={'range'} min={0} max={audioFile?.duration.toString()} value={audioFile?.currentTime} onChange={(e) => audioFile.currentTime = e.target.value} />
                            </div>
                        </div>
                    </div>
                ) : ''
            }

            {
                showMenu && false ? <Menu /> : ''
            }

            {
                !audioFile ? (
                    <div className={styles.startScreen}>
                        <h1>WARNING</h1>
                        <h4>This website may potentially trigger seizures for people with photosensitive epilepsy. Viewer discretion is advised</h4>
                        <button onClick={initAudio} className={styles.startButton}>START</button>
                    </div>
                ) : ''
            }
        </div>
    )
}

function Menu() {
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
                    <li className={router.pathname === '/' ? styles.active : ''}>Home</li>
                    <li>Listen</li>
                    <li>Dan Photon</li>
                    <li>Services</li>
                    <li>Contact</li>
                </ul>
            </aside>
        </>
    );
}

function Bar(props) {
    const ref = useRef();

    useFrame((state, delta) => {
        ref.current.rotation.y += 0.5 * delta;
    });

    return (
        <mesh ref={ref} scale={props.scale} position={props.position}>
            <boxGeometry args={[props.girth, props.height, props.girth]} />
            <meshStandardMaterial color={props.color} />
        </mesh>
    );
}

function Box(props) {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef()
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        ref.current.rotation.x += props.rotationSpeed * delta;
        ref.current.rotation.y += props.rotationSpeed * delta * 1.01;
        // ref.current.rotation.z += props.rotationSpeed * delta * 0.99;
    })
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={ref}
            //onClick={(event) => click(!clicked)}
            // onPointerOver={(event) => hover(true)}
            // onPointerOut={(event) => hover(false)}
            >
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={hovered ? 'red' : props.color}/>
        </mesh>
    )
}