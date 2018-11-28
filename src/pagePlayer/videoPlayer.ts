export default class VideoPlayer {

    // If the document only has containers for video, but no actual videos, return false.
    public static documentHasVideo(): boolean {
        return !!document.getElementsByTagName("video").length;
    }
}
