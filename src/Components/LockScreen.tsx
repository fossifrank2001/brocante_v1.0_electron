import { useState, useEffect } from 'react';
import Toast from "Data/Utilities/Toast.ts";
import UtilMethods from "Data/Utilities/UtilMethods.ts";
import Auth from "Data/Api/Auth.ts";
import {useAppDispatch} from "@/hooks";
import {loginSuccess} from "Data/Slices/auth/userSlice.ts";

const LockScreen = () => {
    const [isLocked, setIsLocked] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const TIMEOUT_DURATION = .5 * 60 * 1000;
    const dispatch = useAppDispatch()

    const handleUserActivity = () => {
        setLastActivity(Date.now());
    };

    useEffect(() => {
        const checkInactivity = () => {
            const currentTime = Date.now();
            if (currentTime - lastActivity >= TIMEOUT_DURATION) {
                setIsLocked(true);
            }
        };

        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('click', handleUserActivity);

        const intervalId = setInterval(checkInactivity, 30000);

        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('click', handleUserActivity);
            clearInterval(intervalId);
        };
    }, [TIMEOUT_DURATION, lastActivity]);

    const handleUnlock = async (e: { preventDefault: () => void; }) => {
        try {
            e.preventDefault();
            setIsLoading(true);

            const currentUser = UtilMethods.authUser();
            if (!password.trim()) {
                Toast.error('Please enter a password.');
                return
            }

            if (currentUser){
                const result = await Auth.login({
                    login: currentUser.email ?? currentUser.phone,
                    password
                })
                dispatch(loginSuccess(result))
                Toast.success("screen unlocked successfully.")
                setIsLocked(false);
                setPassword('');
                setLastActivity(Date.now());
            }
        } catch (e) {
            console.log(e.message)
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (!isLocked) {
        return null;
    }

    return (
        <div className="show" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
        }}>
            <div className="modal-dialog">
                <div className="modal-content bg-white" style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <div className="modal-body text-center p-5">
                        <div className="d-flex flex-column align-items-center">
                            <div className="rounded-circle bg-light p-3 mb-4 d-flex justify-content-center align-items-center"
                                 style={{width: '30px', height: '30px'}}>
                                <i className="ti ti-lock fs-1 text-primary"></i>
                            </div>
                            <h2 className="mb-3 fw-bold">Locked Session</h2>
                            <p className="text-muted mb-4">
                                Please enter your password to continue
                            </p>
                            <form onSubmit={handleUnlock} className="w-100">
                                <div className="mb-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="ti ti-key text-primary"></i>
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control border-start-0 border-end-0"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoFocus
                                            style={{ boxShadow: 'none' }}
                                            disabled={isLoading}
                                        />
                                        <span
                                            className="input-group-text bg-light border-start-0 cursor-pointer"
                                            onClick={togglePasswordVisibility}
                                            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                                        >
                                            <i className={`ti ti-eye${showPassword ? '-off' : ''} text-primary`}></i>
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 position-relative"
                                    style={{ borderRadius: '6px' }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Unlocking...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ti ti-unlock me-2"></i>
                                            Unlock
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;