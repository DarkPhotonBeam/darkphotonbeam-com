import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import {Canvas, useFrame} from '@react-three/fiber'
import {useEffect, useRef, useState} from "react"
import {
    Bloom,
    ChromaticAberration,
    DepthOfField,
    EffectComposer,
    Glitch,
    Noise, Scanline,
    Vignette
} from "@react-three/postprocessing";
import {BlendFunction} from "postprocessing";
import {MdPause, MdPlayArrow, MdSkipNext, MdSkipPrevious} from "react-icons/md";
//import song from '../public/audio/song.mp3'


const playlist = [
    '/audio/executeVersion02.mp3',
    '/audio/buildVersion01.mp3',
    '/audio/circlesVersion02.mp3',
    '/audio/dawn.mp3',
    '/audio/goodMorningGoodNight.mp3',
    '/audio/woodsVersion01.mp3',
    '/audio/projectEuroMirVersion03.mp3',
];

const euler = 2.71828182846;

function getIndex() {
    return localStorage.getItem('audioIndex') !== null ? parseInt(localStorage.getItem('audioIndex')) : 0;
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

    const [showMenu, setShowMenu] = useState(false);
    const [currentMenuInterval, setCurrentMenuInterval] = useState(null);

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
        analyser.smoothingTimeConstant = 0.7; // DEFAULT: 0.8
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

        //console.log(`bass bias: ${_bassBias} mid bias: ${midBias} treble bias: ${trebleBias}`);

        const bassAvg = getBandAverage(freqData, 0, 1);
        const midAvg = getBandAverage(freqData, 2, 5);
        const trebleAvg = getBandAverage(freqData, 6, 31);
        const _volumeAvg = (bassAvg + midAvg + trebleAvg) / 3;
        setVolumeAvg(_volumeAvg * _volumeAvg / 255);

        const bass = (bassAvg*bassAvg) / 255 * _bassBias;
        const mid = (midAvg*midAvg) / 255 * _midBias;
        const treble = (trebleAvg*trebleAvg) / 255 * _trebleBias;

        // const bass = bassAvg * _bassBias;
        // const mid = midAvg * _midBias;
        // const treble = trebleAvg * _trebleBias;

        const scaleOffset = 1;
        const scaleMultiplier = window.innerWidth/window.innerHeight * 15;

        const colorOffset = 40;
        const colorMultiplier = 1;
        //console.log(`bass: ${bass} mid: ${mid} treble: ${treble}`);

        setMeshScale(scaleOffset + ((bass + mid + treble) / (255 * (_bassBias + _midBias + _trebleBias)) * scaleMultiplier));
        setMeshColor([
            colorOffset + parseInt(bass * colorMultiplier - colorOffset),
            colorOffset + parseInt(treble * colorMultiplier - colorOffset),
            colorOffset + parseInt(mid * colorMultiplier - colorOffset),
        ]);
        localStorage.setItem('audioCurrentTime', audioFile.currentTime.toString());

        //setTimeout(() => requestAnimationFrame(animate), 10);
        requestAnimationFrame(animate);
    };

    useEffect(() => {

    }, [])

    useEffect(() => {
        if (audioData !== null) {
            requestAnimationFrame(animate);
        }
    }, [audioData])

    return (
        <div className={styles.container} style={{cursor: showMenu ? 'initial' : 'none'}} onMouseMove={e => {
            setShowMenu(true);
            if (currentMenuInterval !== null) clearInterval(currentMenuInterval);
            const interval = setInterval(() => {
                setShowMenu(false);
            }, 1500);
            setCurrentMenuInterval(interval);
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
                        <Bar key={i} position={[(-(i-6) * 3) - 1.5, 0, -40]} height={amp / 255 * 64} color={`rgb(${parseInt(meshColor[0] * .15)}, ${parseInt(meshColor[1]* .15)}, ${parseInt(meshColor[2]* .15)})`} />
                    )).slice(-30, 30).reverse()
                }
                {
                    frequencyData.map((amp, i) => (
                        <Bar key={i} position={[((i-6) * 3) + 1.5, 0, -40]} height={amp / 255 * 64} color={`rgb(${parseInt(meshColor[0] * .15)}, ${parseInt(meshColor[1]* .15)}, ${parseInt(meshColor[2]* .15)})`} />
                    )).slice(-30, 30)
                }
                <Box rotationSpeed={volumeAvg * .005} color={`rgb(${meshColor[0]}, ${meshColor[1]}, ${meshColor[2]})`} scale={meshScale} position={[0, 0, -20]}/>
                {/*<EffectComposer>*/}
                {/*    /!*<DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />*!/*/}
                {/*    <Bloom luminanceThreshold={0.5} luminanceSmoothing={.5} height={50} />*/}
                {/*    <Scanline blendFunction={BlendFunction.OVERLAY} />*/}
                {/*    <Noise opacity={0.05} />*/}
                {/*</EffectComposer>*/}
            </Canvas>

            {
                audioFile && showMenu ? (
                    <div className={styles.controls}>
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

function Bar(props) {
    const ref = useRef();

    useFrame((state, delta) => {
        ref.current.rotation.y += 0.5 * delta;
    });

    return (
        <mesh ref={ref} scale={props.scale} position={props.position}>
            <boxGeometry args={[.5, props.height, .5]} />
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
            <octahedronGeometry />
            <meshStandardMaterial color={hovered ? 'red' : props.color}/>
        </mesh>
    )
}