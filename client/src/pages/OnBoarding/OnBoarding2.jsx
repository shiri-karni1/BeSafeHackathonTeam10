import Styles from './OnBoarding.module.css';
import { useNavigate } from 'react-router-dom';
import second from '../../assets/sec.svg';


export default function OnBoarding2() {
    const navigate = useNavigate();
    function handleNext() {
        navigate('/onBoarding/OnBoarding3');
    }
    return (
        <div className={Styles.onboardingPage}>
            <h1 className={Styles.title}>מרחב בטוח לכולן</h1>
            <p className={Styles.subtitle}>עם מערכת AI שחוסמת תגובות פוגעניות בזמן אמת, אנחנו מבטיחות שיח  מכבד ונעים לכולן</p>
            <img src={second} alt="OnBoarding Illustration" className={Styles.onboardingImage} />
            <button className={Styles.nextButton} onClick={handleNext}>הבא</button>
        </div>
    )
}