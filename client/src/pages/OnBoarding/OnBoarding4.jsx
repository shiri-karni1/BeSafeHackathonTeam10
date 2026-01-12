import Styles from './OnBoarding.module.css';
import { useNavigate } from 'react-router-dom';
import firstImg from '../../assets/first.svg';

export default function OnBoarding1() {
    const navigate = useNavigate();
    function handleNext() {
        navigate('/onBoarding/OnBoarding2');
    }

    return (
        <div className={Styles.onboardingPage}>
            <h1 className={Styles.title}>מקום להתייעץ, באמת</h1>
            <p className={Styles.subtitle}> הקהילה של IMO כאן כדי שתמיד יהיה לך עם מי לדבר - על הדילמות של היומיום או על הדברים שבאמת חשובים.</p>
            <img src={firstImg} alt="OnBoarding Illustration" className={Styles.onboardingImage} />
            <button className={Styles.nextButton} onClick={handleNext}>הבא</button>
        </div>
    )
}