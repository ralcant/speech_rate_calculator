import React, {useState, useEffect} from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition' //see more at https://www.npmjs.com/package/react-speech-recognition
import { PitchDetector } from 'pitchy';
import Property from "./Property"

// const ml5 = require('ml5');

// const Pitchfinder = require("pitchfinder");
// const detectPitch = Pitchfinder.YIN();

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyserNode = audioContext.createAnalyser();
// let myArrayBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 3, audioContext.sampleRate);

const Speech = () => { 
    // let sourceNode;

    function updatePitch(analyserNode, detector, input, sampleRate) {

        analyserNode.getFloatTimeDomainData(input);
        let [p, c] = detector.findPitch(input, sampleRate);
        console.log("pitch: "+ p);
        console.log("clarity: "+c);
        setPitch(p);
        setClarity(c);
        // if (pitch == 0 && p == 0){
        //     setPitch(1);
        // } else if (pitch == 1 && p == 0){
        //     setPitch(0);
        // } else{
        //     setPitch(p);
        //     setClarity(c);
        // }
    }
    function getPitch(){ //from the example given in https://www.npmjs.com/package/pitchy
        // if (!sourceNode){

        
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            // if (isActive){
                if (window.streamReference){
                    window.streamReference.getAudioTracks().forEach(function(track) {
                        console.log("stopping track..")
                        track.stop();
                    });
                }
                window.streamReference = stream;

                let sourceNode = audioContext.createMediaStreamSource(stream);
                sourceNode.connect(analyserNode);
                const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
                const input = new Float32Array(detector.inputLength);
                updatePitch(analyserNode, detector, input, audioContext.sampleRate);
        });
    }
    const [isActive, setIsActive] = useState(null);    //if continue listening
    const [speech_duration, setDuration]= useState(0);  //duration since started speech
    const [showText, setShowText] = useState(true);     //to decide whether to show the transcript or no  
    const [restart_timer, setRestart] = useState(false);//if it has been restarted
    const [showProperties, setShowProperties] = useState(true);
    const [pitch, setPitch] = useState(0);
    const [clarity, setClarity] = useState(0);

    const { transcript, resetTranscript } = useSpeechRecognition(); 
    function startListening(){
        SpeechRecognition.startListening({continuous: true})
        setIsActive(true);
    }
    function stopListening(){
        // console.log(window.streamReference)
        SpeechRecognition.stopListening();
        setIsActive(false);

        if (window.streamReference) {
            console.log("trying to stop tracks...")
            window.streamReference.getAudioTracks().forEach(function(track) {
                console.log("stopping track..")
                track.stop();
            });
        }   
        // window.streamReference = null;

    }
    function reset(){
        if (window.streamReference){
            window.streamReference.getAudioTracks().forEach(function(track) {
                console.log("stopping track..")
                track.stop();
            });
        }
        resetTranscript();
        SpeechRecognition.stopListening();
        setDuration(0);
        setRestart(true);
        setIsActive(false);
        setClarity(0);
        setPitch(0);
    }
    useEffect(()=>{  //some of this taken from https://upmostly.com/tutorials/build-a-react-timer-component-using-hooks
        console.log("Calling effect...")
        let timer = null;
        if (isActive){ //only update if it's listening
            // console.log("is active")
            timer = setInterval(()=>{
                setDuration(speech_duration => speech_duration+1); //increase by 1 the number of seconds every second
                getPitch();
            }, 1000)
        } else if (speech_duration !== 0 || restart_timer){ //if not active and duration is not 0
            // console.log("second");
            clearInterval(timer);
            SpeechRecognition.stopListening();
            stopListening();
            // muteMic();
        } else{
            // console.log("last");
        }
        return () => {
            clearInterval(timer);
            // stopListening();
        }
    },[isActive, speech_duration, restart_timer, transcript, pitch, clarity])


    function count(text){ //taken from https://stackoverflow.com/questions/18679576/counting-words-in-string 
        return text.length === 0 ? 0: text.trim().split(/\s+/).length;
    }
    function getSpeechRate(){ //returns WPM
        return count(transcript)/speech_duration * 60
    }
    function toggle(){
        setShowText(!showText);
    }
    function toggleProperty(){
        setShowProperties(!showProperties);
    }
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return "Your browser doesnt support Speech Recognition :/"
    } else {
        return (
            <div className="app">
                <div className="row">
                    <button onClick={!isActive ? startListening: stopListening}  className={`button button-primary button-primary-active`} >{isActive ? "Stop": speech_duration === 0 ? "Start": "Continue"}</button>
                    <button onClick={reset}  className={`button button-primary button-primary-inactive`}>Reset</button>
                </div>
  
                <p>Number of words said: <strong>{count(transcript)}</strong></p>
                <p>Duration: {speech_duration}s</p>
                <button className="button" onClick={toggleProperty}>{showProperties ? "Hide properties" : "Show properties"}</button>
                {
                showProperties &&
                <div className="properties">
                    <Property
                    display_name = "WPM"
                    value = {getSpeechRate().toFixed(2)}
                    />
                    <Property
                    display_name = "Pitch"
                    value = {`${pitch.toFixed(1)} Hz` }
                    />
                    <Property
                    display_name = "Clarity"
                    value = {clarity.toFixed(3)}
                    />
                </div>
                }
                <div>
                    <button className="button" onClick={toggle}>{showText ? "Hide text": "Show text"}</button>
                    {
                    showText && 
                    <p>Transcript: {transcript}</p>
                    }
                </div>
            </div>
        )
    }
}

export default Speech;