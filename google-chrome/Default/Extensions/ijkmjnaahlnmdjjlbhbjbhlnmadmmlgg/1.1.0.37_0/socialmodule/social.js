const DEBUG = false;
const DEBUG_EXTENSION_ID = "ijkmjnaahlnmdjjlbhbjbhlnmadmmlgg";

let socialmodule_instance = null;

function dlog(msg) {
    if (DEBUG === true) {
        return console.log(msg);
    }
    return;
}
/**
 localStorage variables
    socialmodule_later_date     (timestamp)
    socialmodule_never          (boolean)
    socialmodule_config         (object)
    socialmodule_updated_at     (timestamp)
    socialmodule_lastshowed     (timestamp)
 */

class SocialModule {
    constructor() {
        if (!socialmodule_instance) {
            socialmodule_instance = this;
        }
        this.created_at = new Date();
        this.bodyDOM = document.querySelector('body');
        this.listeners = {
            "clickInstallNow"   : (e) => { return false; },
            "clickShareFB"      : (e) => { return false; },
            "clickRateNow"      : (e) => { return false; },
            "clickRateLater"    : (e) => { return false; },
            "clickRateNever"    : (e) => { return false; }
        };
        this.demo_frequency = 60000;
        return socialmodule_instance;
    }
    get apiURL() { 
        return `http://social.apihub.info/v1.php`;
    }
    get expireInterval() {
        return 30 * 1000;
    }
    get expireIntervalLater() {
        return 10 * 60 * 1000;
    }
    get demoFrequency() {
        return this.demo_frequency;
    }
    getMessage(msg_id) {
        const msgs = {
            'share'     : (chrome.i18n && chrome.i18n.getMessage("socialmoduleShare")) || 'Share', 
            'fbshare'   : (chrome.i18n && chrome.i18n.getMessage("socialmoduleShareInFB")) ||'Share on Facebook',
            'rateus'    : (chrome.i18n && chrome.i18n.getMessage("socialmoduleRateUs")) ||'Rate Us',
            'ratenow'   : (chrome.i18n && chrome.i18n.getMessage("socialmoduleRateNow")) ||'Rate Now',
            'ratelater' : (chrome.i18n && chrome.i18n.getMessage("socialmoduleLater")) ||'Later',
            'ratenever' : (chrome.i18n && chrome.i18n.getMessage("socialmoduleNever")) ||'No, thanks',
            'more'      : (chrome.i18n && chrome.i18n.getMessage("socialmoduleMoreExtensions")) ||'You Might Like...',
            'installnow': (chrome.i18n && chrome.i18n.getMessage("socialmoduleInstallNow")) ||'Install Now'
        };
        return msgs[msg_id] || "";
    }
    getModalWindowBasic(_id, _header_title) {
        let smd_popup = document.createElement('div');
        smd_popup.className = "socialmodule_popup";
        //    <input class="socialmodule_modal-open" id="socialmodule_modal-_id" type="checkbox" hidden>
        let smd_modal_open = document.createElement('input');
        smd_modal_open.className = "socialmodule_modal-open";
        smd_modal_open.id = `socialmodule_modal-${_id}`;
        smd_modal_open.setAttribute('type', 'checkbox');
        smd_modal_open.setAttribute('hidden', true);
        smd_popup.appendChild(smd_modal_open);
        //    <label class="socialmodule_modal-overlay" for="socialmodule_modal-_id"></label>
        let smd_modal_overlay = document.createElement('label');
        smd_modal_overlay.className = "socialmodule_modal-overlay";
        smd_modal_overlay.setAttribute('for', `socialmodule_modal-${_id}`);
        smd_popup.appendChild(smd_modal_overlay);
        //    <div class="socialmodule_modal socialmodule_modal-2">
        let smd_modal = document.createElement('div');
        smd_modal.className = `socialmodule_modal socialmodule_modal-${_id}`;
        //        <div class="socialmodule_modal-wrap" aria-hidden="true" role="dialog">
        let smd_modal_wrap = document.createElement('div');
        smd_modal_wrap.className = "socialmodule_modal-wrap";
        smd_modal_wrap.setAttribute('aria-hidden', true);
        smd_modal_wrap.setAttribute('role', 'dialog');
        //            <p class="socialmodule_header_title">_header_title</p>
        let smd_header_title = document.createElement('p');
        smd_header_title.className = "socialmodule_header_title";
        smd_header_title.textContent = _header_title;
        smd_modal_wrap.appendChild(smd_header_title);
        //            <label class="socialmodule_btn-close" for="socialmodule_modal-_id" aria-hidden="true">
        let smd_btn_close = document.createElement('label');
        smd_btn_close.className = "socialmodule_btn-close";
        smd_btn_close.setAttribute('for', `socialmodule_modal-${_id}`);
        smd_btn_close.setAttribute('aria-hidden', true);
        //                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
        let smd_svg_close = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        smd_svg_close.setAttribute('width', '12');
        smd_svg_close.setAttribute('height', '12');
        smd_svg_close.setAttribute("viewBox", "0 0 12 12");
        smd_svg_close.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        //                    <path fill="#C1C1C1" fill-rule="evenodd" d="M6.93 6.17l4.4 4.4-1.1 1.1-4.4-4.4L1.6 11.5.5 10.4l4.23-4.23-4.4-4.4 1.1-1.1 4.4 4.4L10.4.5l1.1 1.1-4.57 4.57z"/>
        let smd_svg_path_close = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_close.setAttributeNS(null, 'd', 'M6.93 6.17l4.4 4.4-1.1 1.1-4.4-4.4L1.6 11.5.5 10.4l4.23-4.23-4.4-4.4 1.1-1.1 4.4 4.4L10.4.5l1.1 1.1-4.57 4.57z');
        smd_svg_path_close.setAttributeNS(null, 'fill', '#C1C1C1');
        smd_svg_path_close.setAttributeNS(null, 'fill-rule', 'evenodd');
        smd_svg_close.appendChild(smd_svg_path_close);
        //                </svg>
        smd_btn_close.appendChild(smd_svg_close);
        //            </label>
        smd_modal_wrap.appendChild(smd_btn_close);
        //        </div>
        smd_modal.appendChild(smd_modal_wrap);
        //    </div>
        smd_popup.appendChild(smd_modal);
        //  </div>
        this.bodyDOM.appendChild(smd_popup);
        return {'wrapDOM': smd_modal_wrap, 'openDOM': smd_modal_open};
    }
    /**
        <!-- Modal 1 - Share in Facebook -->
        <div class="socialmodule_popup">
            <input class="socialmodule_modal-open" id="socialmodule_modal-1" type="checkbox" hidden>
            <label class="socialmodule_modal-overlay" for="socialmodule_modal-1"></label>
            <div class="socialmodule_modal socialmodule_modal-1">
                <div class="socialmodule_modal-wrap" aria-hidden="true" role="dialog">
                    <p class="socialmodule_header_title">Share</p>
                    <label class="socialmodule_btn-close" for="socialmodule_modal-1" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                            <path fill="#C1C1C1" fill-rule="evenodd" d="M6.93 6.17l4.4 4.4-1.1 1.1-4.4-4.4L1.6 11.5.5 10.4l4.23-4.23-4.4-4.4 1.1-1.1 4.4 4.4L10.4.5l1.1 1.1-4.57 4.57z"/>
                        </svg>
                    </label>
                    <div class="socialmodule_modal-body socialmodule_fb_share">
                        <svg class="socialmodule_svg_fb" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                            <path class="socialmodule_fb_icon" fill="#FFF" fill-rule="evenodd" d="M34.61 0H5.39A5.39 5.39 0 0 0 0 5.39v29.22A5.39 5.39 0 0 0 5.39 40h14.411l.025-14.294h-3.714a.876.876 0 0 1-.876-.873l-.018-4.607a.876.876 0 0 1 .876-.88h3.707v-4.452c0-5.166 3.156-7.98 7.764-7.98h3.782c.484 0 .877.393.877.877v3.885a.876.876 0 0 1-.876.876l-2.321.001c-2.506 0-2.992 1.191-2.992 2.939v3.854h5.508c.525 0 .932.458.87.98l-.546 4.607a.876.876 0 0 1-.87.773H26.06L26.035 40h8.575A5.39 5.39 0 0 0 40 34.61V5.39A5.39 5.39 0 0 0 34.61 0"/>
                        </svg>
                        <p class="socialmodule_fb_title">Share in Facebook</p>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal 1 -->
     */
    appendFBShare() {
        let smd_obj = this.getModalWindowBasic(1, this.getMessage('share'));
        /* unique code here */
        // <div class="socialmodule_modal-body socialmodule_fb_share">
        let smd_modal_body = document.createElement('div');
        smd_modal_body.className = "socialmodule_modal-body socialmodule_fb_share";
        //      <svg class="socialmodule_svg_fb" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        let smd_svg_fb = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        smd_svg_fb.className.baseVal = "socialmodule_svg_fb";
        smd_svg_fb.setAttribute('width', '40');
        smd_svg_fb.setAttribute('height', '40');
        smd_svg_fb.setAttribute("viewBox", "0 0 40 40");
        smd_svg_fb.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        //          <path class="socialmodule_fb_icon" fill="#FFF" fill-rule="evenodd" d="M34.61 0H5.39A5.39 5.39 0 0 0 0 5.39v29.22A5.39 5.39 0 0 0 5.39 40h14.411l.025-14.294h-3.714a.876.876 0 0 1-.876-.873l-.018-4.607a.876.876 0 0 1 .876-.88h3.707v-4.452c0-5.166 3.156-7.98 7.764-7.98h3.782c.484 0 .877.393.877.877v3.885a.876.876 0 0 1-.876.876l-2.321.001c-2.506 0-2.992 1.191-2.992 2.939v3.854h5.508c.525 0 .932.458.87.98l-.546 4.607a.876.876 0 0 1-.87.773H26.06L26.035 40h8.575A5.39 5.39 0 0 0 40 34.61V5.39A5.39 5.39 0 0 0 34.61 0"/>
        let smd_svg_path_fb = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_fb.setAttributeNS(null, 'd', 'M34.61 0H5.39A5.39 5.39 0 0 0 0 5.39v29.22A5.39 5.39 0 0 0 5.39 40h14.411l.025-14.294h-3.714a.876.876 0 0 1-.876-.873l-.018-4.607a.876.876 0 0 1 .876-.88h3.707v-4.452c0-5.166 3.156-7.98 7.764-7.98h3.782c.484 0 .877.393.877.877v3.885a.876.876 0 0 1-.876.876l-2.321.001c-2.506 0-2.992 1.191-2.992 2.939v3.854h5.508c.525 0 .932.458.87.98l-.546 4.607a.876.876 0 0 1-.87.773H26.06L26.035 40h8.575A5.39 5.39 0 0 0 40 34.61V5.39A5.39 5.39 0 0 0 34.61 0');
        smd_svg_path_fb.setAttributeNS(null, 'fill', '#FFF');
        smd_svg_path_fb.setAttributeNS(null, 'fill-rule', 'evenodd');
        smd_svg_fb.appendChild(smd_svg_path_fb);
        //      </svg>
        smd_modal_body.appendChild(smd_svg_fb);
        //      <p class="socialmodule_fb_title">Share in Facebook</p>
        let smd_fb_title = document.createElement('p');
        smd_fb_title.className = "socialmodule_fb_title";
        smd_fb_title.textContent = this.getMessage('fbshare');
        smd_modal_body.appendChild(smd_fb_title);
        // </div>
        this.listeners["clickShareFB"] = (e) => {
            e.preventDefault();
            window.open(this.getOptions('short_url_fb', `http://www.facebook.com/share.php?u=${encodeURIComponent('https://chrome.google.com/webstore/detail/' + this.extension.id)}`), 
                        'FB_SHARE_WINDOW', 'height=450, width=550, top=' + (window.height / 2 - 275) + ', left=' + (window.width / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
            smd_obj.openDOM.checked = false;
            return false;
        };
        smd_modal_body.addEventListener('click', this.listeners["clickShareFB"])
        smd_obj.wrapDOM.appendChild(smd_modal_body);
    }
    /**
        <!-- Modal 2 - Rate Us -->
        <div class="socialmodule_popup">
            <input class="socialmodule_modal-open" id="socialmodule_modal-2" type="checkbox" hidden>
            <label class="socialmodule_modal-overlay" for="socialmodule_modal-2"></label>
            <div class="socialmodule_modal socialmodule_modal-2">
                <div class="socialmodule_modal-wrap" aria-hidden="true" role="dialog">
                    <p class="socialmodule_header_title">Rate Us</p>
                    <label class="socialmodule_btn-close" for="socialmodule_modal-2" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                            <path fill="#C1C1C1" fill-rule="evenodd" d="M6.93 6.17l4.4 4.4-1.1 1.1-4.4-4.4L1.6 11.5.5 10.4l4.23-4.23-4.4-4.4 1.1-1.1 4.4 4.4L10.4.5l1.1 1.1-4.57 4.57z"/>
                        </svg>
                    </label>

                    <!-- Rate Us block -->
                    <div class="socialmodule_modal-body">
                        <div class="socialmodule_rate_now">
                            <svg class="socialmodule_svg_rate" xmlns="http://www.w3.org/2000/svg" width="28" height="30" viewBox="0 0 28 30">
                                <path class="socialmodule_rate_icon" fill="#FFF" fill-rule="evenodd" d="M27.108 16.766A5.167 5.167 0 0 0 28 13.83c0-1.238-.46-2.315-1.384-3.229-.925-.912-2.018-1.37-3.282-1.37h-3.209C20.71 8.041 21 6.887 21 5.77c0-1.407-.213-2.524-.638-3.354a3.987 3.987 0 0 0-1.86-1.83C17.689.196 16.773 0 15.75 0c-.62 0-1.167.223-1.64.667-.524.505-.9 1.155-1.131 1.948a25.36 25.36 0 0 0-.556 2.28c-.139.727-.355 1.241-.647 1.541a34.988 34.988 0 0 0-1.95 2.308c-1.228 1.574-2.06 2.506-2.497 2.794H2.334a2.26 2.26 0 0 0-1.65.677c-.456.45-.684.995-.684 1.631v11.538c0 .638.227 1.181.684 1.632a2.26 2.26 0 0 0 1.65.676h5.25c.267 0 1.105.241 2.515.72 1.495.518 2.81.912 3.946 1.182 1.137.271 2.288.406 3.455.406h2.352c1.713 0 3.092-.484 4.137-1.452 1.046-.967 1.563-2.286 1.55-3.957.73-.926 1.094-1.995 1.094-3.209 0-.264-.018-.523-.054-.776.46-.804.692-1.67.692-2.595 0-.433-.054-.848-.163-1.245zM4.32 25.042a1.13 1.13 0 0 1-.82.342c-.316 0-.59-.114-.821-.342a1.102 1.102 0 0 1-.346-.812c0-.312.114-.582.346-.811a1.13 1.13 0 0 1 .82-.343c.316 0 .59.115.82.343.231.229.347.5.347.811 0 .314-.116.584-.346.812zm20.954-9.735c-.26.553-.586.836-.974.848.181.204.333.49.456.856.12.367.18.7.18 1 0 .829-.32 1.545-.965 2.146.22.384.329.799.329 1.244 0 .444-.107.886-.32 1.324-.212.439-.5.754-.866.947.062.36.091.697.091 1.009 0 2.007-1.167 3.01-3.5 3.01H17.5c-1.593 0-3.67-.438-6.235-1.315a19.083 19.083 0 0 0-.529-.19l-.647-.225c-.14-.048-.353-.117-.638-.207a10.289 10.289 0 0 0-.692-.199 8.532 8.532 0 0 0-.602-.117 3.765 3.765 0 0 0-.575-.054h-.582V13.847h.582c.195 0 .41-.055.648-.163.237-.108.48-.27.729-.486.249-.216.483-.43.702-.64.219-.21.461-.475.729-.794a34.938 34.938 0 0 0 1.203-1.505c.231-.3.371-.48.42-.541.668-.817 1.136-1.364 1.403-1.64.498-.517.86-1.175 1.084-1.974.226-.8.41-1.554.556-2.263.146-.709.377-1.22.694-1.533 1.167 0 1.945.283 2.332.848.39.565.584 1.436.584 2.614 0 .708-.292 1.673-.875 2.893-.584 1.22-.874 2.179-.874 2.876h6.416c.608 0 1.148.232 1.622.694.475.463.711 1 .711 1.613 0 .421-.13.908-.392 1.46z"/>
                            </svg>
                            <p class="socialmodule_rate_now_title">Rate Now</p>
                        </div>
                        <div class="socialmodule_rate_later"><p class="socialmodule_rate_later_title">Later</p></div>
                        <div class="socialmodule_rate_never"><p class="socialmodule_rate_never_title">No, thanks</p></div>
                    </div>
                    <!-- Rate Us block End -->
                </div>
            </div>
        </div>
        <!-- Modal 2 -->
     */
    appendRateUs() {
        let smd_obj = this.getModalWindowBasic(2, this.getMessage('rateus'));
        // <div class="socialmodule_modal-body">
        let smd_modal_body = document.createElement('div');
        smd_modal_body.className = "socialmodule_modal-body";
        //     <div class="socialmodule_rate_now">
        let smd_rate_now = document.createElement('div');
        smd_rate_now.className = "socialmodule_rate_now";
        //         <svg class="socialmodule_svg_rate" xmlns="http://www.w3.org/2000/svg" width="28" height="30" viewBox="0 0 28 30">
        let smd_svg_rate = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        smd_svg_rate.className.baseVal = "socialmodule_svg_rate";
        smd_svg_rate.setAttribute('width', '28');
        smd_svg_rate.setAttribute('height', '30');
        smd_svg_rate.setAttribute("viewBox", "0 0 28 30");
        smd_svg_rate.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        //             <path class="socialmodule_rate_icon" fill="#FFF" fill-rule="evenodd" d="M27.108 16.766A5.167 5.167 0 0 0 28 13.83c0-1.238-.46-2.315-1.384-3.229-.925-.912-2.018-1.37-3.282-1.37h-3.209C20.71 8.041 21 6.887 21 5.77c0-1.407-.213-2.524-.638-3.354a3.987 3.987 0 0 0-1.86-1.83C17.689.196 16.773 0 15.75 0c-.62 0-1.167.223-1.64.667-.524.505-.9 1.155-1.131 1.948a25.36 25.36 0 0 0-.556 2.28c-.139.727-.355 1.241-.647 1.541a34.988 34.988 0 0 0-1.95 2.308c-1.228 1.574-2.06 2.506-2.497 2.794H2.334a2.26 2.26 0 0 0-1.65.677c-.456.45-.684.995-.684 1.631v11.538c0 .638.227 1.181.684 1.632a2.26 2.26 0 0 0 1.65.676h5.25c.267 0 1.105.241 2.515.72 1.495.518 2.81.912 3.946 1.182 1.137.271 2.288.406 3.455.406h2.352c1.713 0 3.092-.484 4.137-1.452 1.046-.967 1.563-2.286 1.55-3.957.73-.926 1.094-1.995 1.094-3.209 0-.264-.018-.523-.054-.776.46-.804.692-1.67.692-2.595 0-.433-.054-.848-.163-1.245zM4.32 25.042a1.13 1.13 0 0 1-.82.342c-.316 0-.59-.114-.821-.342a1.102 1.102 0 0 1-.346-.812c0-.312.114-.582.346-.811a1.13 1.13 0 0 1 .82-.343c.316 0 .59.115.82.343.231.229.347.5.347.811 0 .314-.116.584-.346.812zm20.954-9.735c-.26.553-.586.836-.974.848.181.204.333.49.456.856.12.367.18.7.18 1 0 .829-.32 1.545-.965 2.146.22.384.329.799.329 1.244 0 .444-.107.886-.32 1.324-.212.439-.5.754-.866.947.062.36.091.697.091 1.009 0 2.007-1.167 3.01-3.5 3.01H17.5c-1.593 0-3.67-.438-6.235-1.315a19.083 19.083 0 0 0-.529-.19l-.647-.225c-.14-.048-.353-.117-.638-.207a10.289 10.289 0 0 0-.692-.199 8.532 8.532 0 0 0-.602-.117 3.765 3.765 0 0 0-.575-.054h-.582V13.847h.582c.195 0 .41-.055.648-.163.237-.108.48-.27.729-.486.249-.216.483-.43.702-.64.219-.21.461-.475.729-.794a34.938 34.938 0 0 0 1.203-1.505c.231-.3.371-.48.42-.541.668-.817 1.136-1.364 1.403-1.64.498-.517.86-1.175 1.084-1.974.226-.8.41-1.554.556-2.263.146-.709.377-1.22.694-1.533 1.167 0 1.945.283 2.332.848.39.565.584 1.436.584 2.614 0 .708-.292 1.673-.875 2.893-.584 1.22-.874 2.179-.874 2.876h6.416c.608 0 1.148.232 1.622.694.475.463.711 1 .711 1.613 0 .421-.13.908-.392 1.46z"/>
        let smd_svg_path_rate = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_rate.setAttributeNS(null, 'd', 'M27.108 16.766A5.167 5.167 0 0 0 28 13.83c0-1.238-.46-2.315-1.384-3.229-.925-.912-2.018-1.37-3.282-1.37h-3.209C20.71 8.041 21 6.887 21 5.77c0-1.407-.213-2.524-.638-3.354a3.987 3.987 0 0 0-1.86-1.83C17.689.196 16.773 0 15.75 0c-.62 0-1.167.223-1.64.667-.524.505-.9 1.155-1.131 1.948a25.36 25.36 0 0 0-.556 2.28c-.139.727-.355 1.241-.647 1.541a34.988 34.988 0 0 0-1.95 2.308c-1.228 1.574-2.06 2.506-2.497 2.794H2.334a2.26 2.26 0 0 0-1.65.677c-.456.45-.684.995-.684 1.631v11.538c0 .638.227 1.181.684 1.632a2.26 2.26 0 0 0 1.65.676h5.25c.267 0 1.105.241 2.515.72 1.495.518 2.81.912 3.946 1.182 1.137.271 2.288.406 3.455.406h2.352c1.713 0 3.092-.484 4.137-1.452 1.046-.967 1.563-2.286 1.55-3.957.73-.926 1.094-1.995 1.094-3.209 0-.264-.018-.523-.054-.776.46-.804.692-1.67.692-2.595 0-.433-.054-.848-.163-1.245zM4.32 25.042a1.13 1.13 0 0 1-.82.342c-.316 0-.59-.114-.821-.342a1.102 1.102 0 0 1-.346-.812c0-.312.114-.582.346-.811a1.13 1.13 0 0 1 .82-.343c.316 0 .59.115.82.343.231.229.347.5.347.811 0 .314-.116.584-.346.812zm20.954-9.735c-.26.553-.586.836-.974.848.181.204.333.49.456.856.12.367.18.7.18 1 0 .829-.32 1.545-.965 2.146.22.384.329.799.329 1.244 0 .444-.107.886-.32 1.324-.212.439-.5.754-.866.947.062.36.091.697.091 1.009 0 2.007-1.167 3.01-3.5 3.01H17.5c-1.593 0-3.67-.438-6.235-1.315a19.083 19.083 0 0 0-.529-.19l-.647-.225c-.14-.048-.353-.117-.638-.207a10.289 10.289 0 0 0-.692-.199 8.532 8.532 0 0 0-.602-.117 3.765 3.765 0 0 0-.575-.054h-.582V13.847h.582c.195 0 .41-.055.648-.163.237-.108.48-.27.729-.486.249-.216.483-.43.702-.64.219-.21.461-.475.729-.794a34.938 34.938 0 0 0 1.203-1.505c.231-.3.371-.48.42-.541.668-.817 1.136-1.364 1.403-1.64.498-.517.86-1.175 1.084-1.974.226-.8.41-1.554.556-2.263.146-.709.377-1.22.694-1.533 1.167 0 1.945.283 2.332.848.39.565.584 1.436.584 2.614 0 .708-.292 1.673-.875 2.893-.584 1.22-.874 2.179-.874 2.876h6.416c.608 0 1.148.232 1.622.694.475.463.711 1 .711 1.613 0 .421-.13.908-.392 1.46z');
        smd_svg_path_rate.setAttributeNS(null, 'fill', '#FFF');
        smd_svg_path_rate.setAttributeNS(null, 'fill-rule', 'evenodd');
        smd_svg_rate.appendChild(smd_svg_path_rate);
        //         </svg>
        smd_rate_now.appendChild(smd_svg_rate);
        //         <p class="socialmodule_rate_now_title">Rate Now</p>
        let smd_rate_now_title = document.createElement('p');
        smd_rate_now_title.className = "socialmodule_rate_now_title";
        smd_rate_now_title.textContent = this.getMessage('ratenow');
        smd_rate_now.appendChild(smd_rate_now_title);
        //     </div>
        this.listeners["clickRateNow"] = (e) => {
            e.preventDefault();
            window.open(this.getOptions('short_url_reviews', `https://chrome.google.com/webstore/detail/${this.extension.id}/reviews`), 'RateWindow', 'height=750, width=1050, top=' + (window.height / 2 - 275) + ', left=' + (window.width / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
            localStorage['socialmodule_never'] = true;
            smd_obj.openDOM.checked = false;
            return false;
        };
        smd_rate_now.addEventListener('click', this.listeners["clickRateNow"]);
        smd_modal_body.appendChild(smd_rate_now);
        //     <div class="socialmodule_rate_later"><p class="socialmodule_rate_later_title">Later</p></div>
        let smd_rate_later = document.createElement('div');
        smd_rate_later.className = "socialmodule_rate_later";
        let smd_rate_later_title = document.createElement('p');
        smd_rate_later_title.className = "socialmodule_rate_later_title";
        smd_rate_later_title.textContent = this.getMessage('ratelater');
        smd_rate_later.appendChild(smd_rate_later_title);
        this.listeners["clickRateLater"] = (e) => {
            e.preventDefault();
            localStorage['socialmodule_later_date'] = Date.now(); 
            smd_obj.openDOM.checked = false;
            return false;
        };
        smd_rate_later.addEventListener('click', this.listeners["clickRateLater"]);
        smd_modal_body.appendChild(smd_rate_later);
        //     <div class="socialmodule_rate_never"><p class="socialmodule_rate_never_title">No, thanks</p></div>
        let smd_rate_never = document.createElement('div');
        smd_rate_never.className = "socialmodule_rate_never";
        let smd_rate_never_title = document.createElement('p');
        smd_rate_never_title.className = "socialmodule_rate_never_title";
        smd_rate_never_title.textContent = this.getMessage('ratenever');
        smd_rate_never.appendChild(smd_rate_never_title);
        this.listeners["clickRateLater"] = (e) => {
            e.preventDefault();
            localStorage['socialmodule_never'] = true;
            smd_obj.openDOM.checked = false;
            return false;
        };
        smd_rate_never.addEventListener('click', this.listeners["clickRateLater"]);
        smd_modal_body.appendChild(smd_rate_never);
        // </div>
        smd_obj.wrapDOM.appendChild(smd_modal_body);
    }
    /**
        <!-- Modal 3 - More Extensions -->
        <div class="socialmodule_popup">
            <input class="socialmodule_modal-open" id="socialmodule_modal-3" type="checkbox" hidden>
            <label class="socialmodule_modal-overlay" for="socialmodule_modal-3"></label>
            <div class="socialmodule_modal socialmodule_modal-3">
                <div class="socialmodule_modal-wrap" aria-hidden="true" role="dialog">
                    <p class="socialmodule_header_title">More Extensions</p>
                    <label class="socialmodule_btn-close" for="socialmodule_modal-3" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                            <path fill="#C1C1C1" fill-rule="evenodd" d="M6.93 6.17l4.4 4.4-1.1 1.1-4.4-4.4L1.6 11.5.5 10.4l4.23-4.23-4.4-4.4 1.1-1.1 4.4 4.4L10.4.5l1.1 1.1-4.57 4.57z"/>
                        </svg>
                    </label>

                    <!-- More Extensions block -->
                    <div class="socialmodule_modal-body socialmodule_more_extensions">
                        <img class="socialmodule_more_extension_icon" src="icon128.png" />
                        <p class="socialmodule_more_extensions_title">Tetris Puzzle Game</p>
                        <svg class="socialmodule_svg_more" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="76" height="12" viewBox="0 0 76 12">
                            <defs>
                                <path id="a" d="M0 0h6v12H0z"/>
                            </defs>
                            <g fill="none" fill-rule="evenodd">
                                <path fill="#FFB950" d="M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM27.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L22.772.5A.853.853 0 0 0 22 0a.855.855 0 0 0-.772.501L19.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM43.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L38.772.5A.853.853 0 0 0 38 0a.855.855 0 0 0-.772.501L35.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM59.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L54.772.5A.853.853 0 0 0 54 0a.855.855 0 0 0-.772.501L51.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z"/>
                                <g transform="translate(64)">
                                    <path fill="#E2E4E5" d="M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z"/>
                                    <mask id="b" fill="#fff">
                                        <use xlink:href="#a"/>
                                    </mask>
                                    <path fill="#FFB950" d="M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z" mask="url(#b)"/>
                                </g>
                            </g>
                        </svg>
                        <div class="socialmodule_more_install"><p class="socialmodule_more_install_title">Install Now</p></div>
                    </div>
                    <!-- More Extensions block End -->
                </div>
            </div>
        </div>
        <!-- Modal 3 -->
     */
    appendSeeAlso(idx = 0) {
        let smd_obj = this.getModalWindowBasic(3, this.getMessage('more'));
        // <div class="socialmodule_modal-body socialmodule_more_extensions">
        let smd_modal_body = document.createElement('div');
        smd_modal_body.className = "socialmodule_modal-body socialmodule_more_extensions";
        //     <img class="socialmodule_more_extension_icon" src="icon128.png" />
        let smd_more_icon = document.createElement('img');
        smd_more_icon.className = "socialmodule_more_extension_icon";
        smd_more_icon.src = this.see_also[idx].icon;
        smd_modal_body.appendChild(smd_more_icon);
        //     <p class="socialmodule_more_extensions_title">Tetris Puzzle Game</p>
        let smd_more_title = document.createElement('p');
        smd_more_title.className = "socialmodule_more_extensions_title";
        smd_more_title.textContent = this.see_also[idx].name[this.extension.lang === 'ru_RU' ? 'ru_RU' : 'en_US'];
        smd_modal_body.appendChild(smd_more_title);
        //     <svg class="socialmodule_svg_more" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="76" height="12" viewBox="0 0 76 12">
        let smd_svg_more = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        smd_svg_more.className.baseVal = "socialmodule_svg_more";
        smd_svg_more.setAttribute('width', '76');
        smd_svg_more.setAttribute('height', '12');
        smd_svg_more.setAttribute("viewBox", "0 0 76 12");
        smd_svg_more.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        //         <defs>
        let smd_svg_defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        //             <path id="a" d="M0 0h6v12H0z"/>
        let smd_svg_path_defs = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_defs.setAttributeNS(null, 'd', 'M0 0h6v12H0z');
        smd_svg_path_defs.setAttributeNS(null, 'id', 'a');
        smd_svg_defs.appendChild(smd_svg_path_defs);
        //         </defs>
        smd_svg_more.appendChild(smd_svg_defs);
        //         <g fill="none" fill-rule="evenodd">
        let smd_svg_g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        smd_svg_g.setAttributeNS(null, 'fill', 'none');
        smd_svg_g.setAttributeNS(null, 'fill-rule', 'evenodd');
        //             <path fill="#FFB950" d="M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM27.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L22.772.5A.853.853 0 0 0 22 0a.855.855 0 0 0-.772.501L19.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM43.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L38.772.5A.853.853 0 0 0 38 0a.855.855 0 0 0-.772.501L35.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM59.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L54.772.5A.853.853 0 0 0 54 0a.855.855 0 0 0-.772.501L51.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z"/>
        let smd_svg_path_one = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_one.setAttributeNS(null, 'd', 'M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM27.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L22.772.5A.853.853 0 0 0 22 0a.855.855 0 0 0-.772.501L19.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM43.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L38.772.5A.853.853 0 0 0 38 0a.855.855 0 0 0-.772.501L35.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138zM59.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L54.772.5A.853.853 0 0 0 54 0a.855.855 0 0 0-.772.501L51.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z');
        smd_svg_path_one.setAttributeNS(null, 'fill', '#FFB950');
        smd_svg_g.appendChild(smd_svg_path_one);
        //             <g transform="translate(64)">
        let smd_svg_ig = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        smd_svg_ig.setAttributeNS(null, 'transform', 'translate(64)');
        //                 <path fill="#E2E4E5" d="M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z"/>
        let smd_svg_path_two = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_two.setAttributeNS(null, 'd', 'M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z');
        smd_svg_path_two.setAttributeNS(null, 'fill', '#E2E4E5');
        smd_svg_ig.appendChild(smd_svg_path_two);
        //                 <mask id="b" fill="#fff">
        let smd_svg_mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
        smd_svg_mask.setAttributeNS(null, 'id', 'b');
        smd_svg_mask.setAttributeNS(null, 'fill', '#fff');
        //                     <use xlink:href="#a"/>
        let smd_svg_use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        smd_svg_use.setAttributeNS("http://www.w3.org/1999/xlink", 'href', '#a');
        smd_svg_mask.appendChild(smd_svg_use);
        //                 </mask>
        smd_svg_ig.appendChild(smd_svg_mask);
        //                 <path fill="#FFB950" d="M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z" mask="url(#b)"/>
        let smd_svg_path_three = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        smd_svg_path_three.setAttributeNS(null, 'd', 'M11.74 5.439a.922.922 0 0 0 .217-.922.863.863 0 0 0-.694-.61l-2.906-.441a.384.384 0 0 1-.286-.217L6.772.5A.853.853 0 0 0 6 0a.855.855 0 0 0-.772.501L3.93 3.249a.381.381 0 0 1-.286.217l-2.905.44a.864.864 0 0 0-.696.611c-.1.329-.018.681.218.922l2.103 2.138a.41.41 0 0 1 .109.351l-.496 3.02a.912.912 0 0 0 .187.728.844.844 0 0 0 1.062.219l2.598-1.426a.373.373 0 0 1 .354 0l2.6 1.426c.125.07.26.105.4.105a.848.848 0 0 0 .66-.324.91.91 0 0 0 .188-.728l-.497-3.02a.41.41 0 0 1 .11-.351l2.102-2.138z');
        smd_svg_path_three.setAttributeNS(null, 'fill', '#FFB950');
        smd_svg_path_three.setAttributeNS(null, 'mask', 'url(#b)');
        smd_svg_ig.appendChild(smd_svg_path_three);
        //             </g>
        smd_svg_g.appendChild(smd_svg_ig);
        //         </g>
        smd_svg_more.appendChild(smd_svg_g);
        //     </svg>
        smd_modal_body.appendChild(smd_svg_more);
        //     <div class="socialmodule_more_install"><p class="socialmodule_more_install_title">Install Now</p></div>
        let smd_install = document.createElement('div');
        smd_install.className = "socialmodule_more_install";
        let smd_install_title = document.createElement('p');
        smd_install_title.className = "socialmodule_more_install_title";
        smd_install_title.textContent = this.getMessage('installnow');
        smd_install.appendChild(smd_install_title);
        this.listeners["clickInstallNow"] = (e) => {
            e.preventDefault();
            window.open(this.see_also[idx].hasOwnProperty('short_url') ? this.see_also[idx].short_url : `https://chrome.google.com/webstore/detail/${this.see_also[idx].extension_id}`, 'SeeAlsoWindow', 'height=750, width=1050, top=' + (window.height / 2 - 275) + ', left=' + (window.width / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
            smd_obj.openDOM.checked = false;
            return false;
        };
        smd_install.addEventListener('click', this.listeners["clickInstallNow"]);
        smd_modal_body.appendChild(smd_install);
        // </div>
        smd_obj.wrapDOM.appendChild(smd_modal_body);
    }
    updateSeeAlso(idx = 0) {
        try {
            document.querySelector('.socialmodule_more_extension_icon').src = this.see_also[idx].icon;
            document.querySelector('.socialmodule_more_extensions_title').textContent = this.see_also[idx].name[this.extension.lang === 'ru_RU' ? 'ru_RU' : 'en_US'];
            // TODO: change rating
            document.querySelector('.socialmodule_more_install').removeEventListener('click', this.listeners["clickInstallNow"]);
            this.listeners["clickInstallNow"] = (e) => {
                e.preventDefault();
                window.open(this.see_also[idx].hasOwnProperty('short_url') ? this.see_also[idx].short_url : `https://chrome.google.com/webstore/detail/${this.see_also[idx].extension_id}`, 'SeeAlsoWindow', 'height=750, width=1050, top=' + (window.height / 2 - 275) + ', left=' + (window.width / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
                document.querySelector(`#socialmodule_modal-3`).checked = false;
                return false;
            };
            document.querySelector('.socialmodule_more_install').addEventListener('click', this.listeners["clickInstallNow"]);
        } catch (e) {
            // TODO: handle exception
        }
    }
    save() {
        localStorage['socialmodule_config'] = JSON.stringify({
            show_probabilities  : this.show_probabilities,
            see_also            : this.see_also,
            opts                : this.opts 
        });
        localStorage['socialmodule_updated_at'] = Date.now();
    }
    load() {
        let config = undefined;
        try {
            if (localStorage['socialmodule_config']) {
                config = JSON.parse(localStorage['socialmodule_config']);
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
        return true;
    }
    initialize() {
        this.extension = {
            id    : DEBUG ? DEBUG_EXTENSION_ID : chrome.i18n.getMessage('@@extension_id'),
            lang  : chrome.i18n.getMessage('@@ui_locale'),
            title : chrome.i18n.getMessage("appName")
        };
        return new Promise((resolve, reject) => {
            if (this.load()) {
                if (Date.now() - localStorage['socialmodule_updated_at'] > this.expireInterval) {
                    resolve({status: 'expired'});
                } else {
                    reject({status: 'exist'});
                }
            } else {
                resolve({status: 'loading'});
            }
        })
        .then(data => {
            return fetch(`${this.apiURL}?id=${this.extension.id}`, {mode: 'cors'});
        })
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        })
        .then((response) => {
            let contentType = response.headers.get("content-type");
            if(contentType && contentType.includes("application/json")) {
                return response.json();
            }
            throw new TypeError("Oops, we haven't got JSON!");
        })
        .then((json) => {
            dlog(json);
            // TODO: check json data
            return this.configurate(json);
        })
        .catch((error) => {
            dlog(error);
            if (error.status !== 'exist') {
                return this.configurate();
            } else {
                return this.configurate(JSON.parse(localStorage['socialmodule_config']));
            }
        });
    }
    getOptions(opt_name, default_value) {
        let idx = -1;
        let i = 0;
        while (idx === -1 && i < this.opts.length) {
            if (this.opts[i].name === opt_name) {
                idx = i;
            }
            i++;
        }
        return (idx === -1) ? default_value : this.opts[idx].value;
    }
    configurate(config = {show_probabilities: [50, 50, 0], see_also: [], opts: [{name: "iwdelay", value: 0}]}) {
        try {
            this.show_probabilities = config.show_probabilities.slice(0);
            this.see_also = config.see_also.slice(0);
            this.opts = config.opts.slice(0);
        } catch (e) {
            this.show_probabilities = [50, 50, 0];
            this.see_also = [];
            this.opts = [{name: "iwdelay", value: 0}];
        } finally {
            this.demo_frequency = parseInt(this.getOptions('demo_frequency', 60000));
            this.save();
            // TODO: add auto timer for show if it's necessary
            this.appendFBShare();
            this.appendRateUs();
            (this.show_probabilities[2] > 0) && (this.see_also.length > 0 ? this.appendSeeAlso(this.getRandomInt(0, this.see_also.length)): this.appendSeeAlso());
            return JSON.stringify(config);
        }
    }
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    /**
     * CDF = Cumulative Distribution Function
     */
    CumulativeDistributionFunction() {
        if (!this.show_probabilities || this.show_probabilities.length < 3) {
            return Promise.resolve(-1);
        }
        let show_probs = this.show_probabilities.slice(0);
        let sum_prob = show_probs.reduce((accumulator, currentValue) => accumulator + currentValue);
        if ((localStorage["socialmodule_never"]) ||
            (Date.now() - localStorage["socialmodule_later_date"]) <= this.expireIntervalLater) {
            sum_prob -= show_probs[1];
            show_probs[1] = 0;
            show_probs[0] = parseInt((show_probs[0]/sum_prob) * 100);
            show_probs[2] = Math.sign(show_probs[2]) * (100 - show_probs[0]);
            sum_prob = show_probs[0] + show_probs[1] + show_probs[2];
        }
        return Promise.all(this.see_also.map((extension) => {
                return this.isInstalled(extension.extension_id)
            }))
            .then(installed => {
                this.see_also = this.see_also.filter((val, idx) => {
                    return !installed[idx].install;
                });
                if (this.see_also.length === 0) {
                    sum_prob -= show_probs[2];
                    show_probs[2] = 0;
                    show_probs[0] = parseInt((show_probs[0]/sum_prob) * 100);
                    show_probs[1] = Math.sign(show_probs[1]) * (100 - show_probs[0]);
                    sum_prob = show_probs[0] + show_probs[1] + show_probs[2];
                }
                let prob = this.getRandomInt(1, sum_prob + 1);
                if (prob <= show_probs[0]) {
                    return 1;
                } else if (prob <= show_probs[0] + show_probs[1]) {
                    return 2;
                } else if (prob <= show_probs[0] + show_probs[1] + show_probs[2]) {
                    return 3;
                }
                return -1;
            })
    }
    showSocial() {
        if (Date.now() - localStorage["socialmodule_lastshowed"] <= this.demoFrequency) {
            return false;
        }
        if (!this.show_probabilities || this.show_probabilities.length < 3) {
            return false;
        }
        this.CumulativeDistributionFunction()
        .then(modalIdx => {
            for (let i = 1; i <= 3; i++) {
                (this.show_probabilities[i - 1] > 0) && (document.querySelector(`#socialmodule_modal-${i}`).checked = false);
            }
            if (modalIdx > 0) {
                if (modalIdx === 3 && this.see_also.length > 0) {
                    this.updateSeeAlso(this.getRandomInt(0, this.see_also.length));
                } 
                localStorage["socialmodule_lastshowed"] = Date.now();
                document.querySelector(`#socialmodule_modal-${modalIdx}`).checked = true;
            } else {
                dlog('error');
            }
        })
    }
    isInstalled(extension_id) {
        return new Promise((resolve, reject) => {
            try {
                chrome.management.get(`${extension_id}`, ExtensionInfo => {
                    if (chrome.runtime.lastError) {
                        resolve({ eid: extension_id, install: false});
                    }
                    resolve({ eid: extension_id, install: true});
                });
            } catch (e) {
                reject({message: "Unexpected Error"});
            }
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            return { eid: extension_id, install: extension_id === this.extension.id };
        });
    }
}

let SocialModuleInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    SocialModuleInstance = new SocialModule();
    SocialModuleInstance.initialize()
    .then(response => {
        dlog(`SUCCESS data = ${response}`);
    })
    .catch(error => {
        dlog(error)
    });
});