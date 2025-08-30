
import Feedback from './feedback';

// ASSETS
import './style.css';

export default function FeedbackTray() {
    return (
        <>
            <div className="feedback-scroller scroller-top my-5">
                <div className="">
                    <Feedback />
                </div>
            </div>
            <div className="feedback-scroller scroller-bottom my-10 hidden md:block">
                <div className="">
                    <Feedback />
                </div>
            </div>
        </>
    )
}