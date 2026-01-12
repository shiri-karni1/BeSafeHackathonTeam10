import Styles from './OnBoarding.module.css';
import { useNavigate } from 'react-router-dom';
import third from '../../assets/third.svg';

export default function OnBoarding3() {
    const navigate = useNavigate();
    function handleNext() {
        navigate('/login');
    }
    return (
        <div className={Styles.onboardingPage}>
            <h1 className={Styles.title}>ייעוץ אמין ומדויק</h1>
            <p className={Styles.subtitle}>הודעות לא מהימנות יסומנו במסגרת כתומה, כדי לאפשר לך לקרוא את העצות שקיבלת באופן ביקורתי וזהיר. רק הודעות שלא יאותרו כמטעות יסומנו בירוק.</p>
            <img src={third} alt="OnBoarding Illustration" className={Styles.onboardingImage} />
            <button className={Styles.nextButton} onClick={handleNext}>בואי נתחיל!</button>
        </div>
    )
}