import React, {useState, useEffect} from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition' //see more at https://www.npmjs.com/package/react-speech-recognition

const Speech = () => { 
    const [isActive, setIsActive] = useState(false);    //if continue listening
    const [speech_duration, setDuration]= useState(0);  //duration since started speech
    const [showText, setShowText] = useState(true);     //to decide whether to show the transcript or no  
    const [restart_timer, setRestart] = useState(false);//if it has been restarted

    const { transcript, resetTranscript } = useSpeechRecognition(); 
    function startListening(){
        SpeechRecognition.startListening({continuous: true})
        setIsActive(true);
    }
    function stopListening(){
        SpeechRecognition.stopListening();
        setIsActive(false);
    }
    function reset(){
        resetTranscript();
        SpeechRecognition.stopListening();
        setDuration(0);
        setRestart(true);
        setIsActive(false);
    }
    useEffect(()=>{ //some of this taken from //some of this taken from https://upmostly.com/tutorials/build-a-react-timer-component-using-hooks
        let timer = null;
        if (isActive){ //only update if it's listening
            timer = setInterval(()=>{
                setDuration(speech_duration => speech_duration+1); //increase by 1 the number of seconds every second
            }, 1000)
        } else if (speech_duration !== 0 || restart_timer){ //if not active and duration is not 0
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isActive, speech_duration])

    function count(text){ //taken from https://stackoverflow.com/questions/18679576/counting-words-in-string 
        return text.length === 0 ? 0: text.trim().split(/\s+/).length;
    }
    function getSpeechRate(){ //returns WPM
        return count(transcript)/speech_duration * 60
    }
    function toggle(){
        setShowText(!showText);
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
                <p>Durtion: {speech_duration}s</p>
                <p>WPM: {getSpeechRate()}</p>
                <br/>
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