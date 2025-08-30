import '@/app/components/feedback/style.css';
import clsx from 'clsx';

const feedbacks = [
    { id: 1, content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum sed ex cupiditate, esse voluptatum illo nulla. Odit, vel!', rating: 5 },
    { id: 2, content: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed, aperiam.', rating: 3 },
    { id: 3, content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora assumenda velit aspernatur aliquid sunt fuga obcaecati voluptatem?', rating: 2 },
    // {id: 4, content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', rating: 5},
    // {id: 5, content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.', rating: 4},
    // {id: 6, content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum sed ex cupiditate, esse voluptatum illo nulla. Odit, vel!', rating: 1},
    // {id: 7, content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora assumenda velit aspernatur aliquid sunt fuga obcaecati voluptatem?', rating: 4},
    // {id: 8, content: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed, aperiam.', rating: 3},
];

export default function feedback() {

    const container = [];

    for (let i = 0; i < 2; i++) {
        container.push(
            feedbacks.map((feedback, i: number) => {
                return (
                    <div className={clsx("card p-5 card_" + feedback.id,
                        { 'duplicate': i == 1 }
                    )} key={i}>
                        {/* <p className='text-white text-2xl'>{feedback.id}</p> */}
                        <div key={feedback.id} className="rounded-[10px] p-5 text-black border-2 border-black">
                            <div className="card-header flex">
                                <div className="user-profile w-[50px] h-[50px] mr-5"></div>
                                <div>
                                    <p>User user{feedback.id}</p>
                                    <p>@user{feedback.id}</p>
                                </div>
                            </div>
                            <br />
                            <hr />
                            <br />
                            <div className="card-content">
                                <p>{feedback.content}</p>
                            </div>
                        </div>
                    </div>
                );
            })
        )
    }
    return (
        <>
            {container}
        </>
    )
}
