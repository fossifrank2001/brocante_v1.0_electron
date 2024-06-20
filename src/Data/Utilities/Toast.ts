import { toast, ToastPosition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Toast {
    static success(message: string, duration: number = 3000, position: ToastPosition = 'top-right'): void {
        toast.success(message, { autoClose: duration, position: position });
    }

    static error(message: string, duration: number = 5000, position: ToastPosition = 'bottom-right'): void {
        toast.error(message, { autoClose: duration, position: position });
    }

    static warning(message: string, duration: number = 3000, position: ToastPosition = 'top-left'): void {
        toast.warn(message, { autoClose: duration, position: position });
    }
}

export default Toast;
