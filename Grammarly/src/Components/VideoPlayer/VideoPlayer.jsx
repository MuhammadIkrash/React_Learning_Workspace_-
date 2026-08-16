import "./videoPlayer.css";
import collageVideo from "../../Assets/video.mp4";
import { useRef } from "react";
const VideoPlayer = ({ play, setPlay }) => {
    const player = useRef(null)
    const hideVideo = (e)=>{
        if(e.target === player.current){
            setPlay(false)
        }
    }
  return (
    <div ref={player} className={`videoPlayer ${play ? "" : "hide"}`} onClick={hideVideo}>
      <video src={collageVideo} muted autoPlay></video>
    </div>
  );
};

export default VideoPlayer;
