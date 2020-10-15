// https://regexr.com/3dj5t
const regex = new RegExp(
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
);

export const validateYouTubeUrl = (url: string) => {
    if (url.match(regex)) {
        return true;
    }
    return false;
};
