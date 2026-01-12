import Styles from './OnBoarding.module.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function OnBoarding4() {
    const navigate = useNavigate();
    function handleNext() {
        navigate('/onBoarding/OnBoarding4');
    }
    return (
        <div className={Styles.onboardingPage}>
            <img src={logo} alt="Logo" className={Styles.logo} />
            <p className={Styles.title}>קהילה תומכת ובטוחה לשאול, להתייעץ ולצמוח איתה. </p>
            <button className={Styles.nextButton} onClick={handleNext}>הבא</button>
        </div>
    )
}