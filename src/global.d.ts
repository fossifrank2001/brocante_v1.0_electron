import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
        ipcRenderer: {
            on: (...args: any[]) => any;
            off: (...args: any[]) => any;
            send: (...args: any[]) => any;
            invoke: (...args: any[]) => Promise<any>;
            getApiUrl: () => Promise<{ baseUrl: string; port: number }>;
        };
    }
}

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '78c00ebb3305d55cf346',
    cluster: 'mt1',
    forceTLS: true,
});
