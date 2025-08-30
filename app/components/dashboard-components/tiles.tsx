
export async function PricingTile() {
    const response = await fetch('http://localhost:3000/api/pricing/', { method: 'GET', cache: 'no-cache'})
    let data = [];

    if (response.status === 200) {
        try {
            const result = await response.json();
            data = await JSON.parse(result.data);
        } catch (error) {
        }
    } else {
        console.log("error");
    }

    return (
        <>
            <h1 className='text-gray-500 text-lg'><span className='text-4xl text-black'>{ data.length }</span> Pricing package</h1>
            <p>{ data.length} current active</p>
        </>
    )
}

export async function ClassTile() {
    const response = await fetch('http://localhost:3000/api/pricing/pricing-class', { method: 'GET'})
    let data = [];

    if (response.status === 200) {
        try {
            const result = await response.json();
            data = await JSON.parse(result.data);
        } catch (error) {
            console.log("error");
        }
    } else {
        console.log("error");
    }

    return (
        <>
            <h1 className='text-gray-500 text-lg'><span className='text-4xl text-black'>{ data.length }</span> Pricing class</h1>
            <p>{data.length} current active</p>
        </>
    )
}