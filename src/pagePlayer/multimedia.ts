import Animation from "./animation";
import Narration from "./narration";
import VideoPlayer from "./videoPlayer";

export default class Multimedia {
    public static documentHasMultimedia(): boolean {
        return Narration.documentHasNarration() ||
            Animation.documentHasAnimation() ||
            VideoPlayer.documentHasVideo();
    }
}
