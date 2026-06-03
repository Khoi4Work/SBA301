import React, { useState, useEffect } from 'react';

const SloganComponent = () => {
    const [slogan, setSlogan] = useState("Slogan mặc định trong lúc chờ tải...");

    useEffect(() => {
        fetch('/api/slogans/current')
            .then(response => response.json())
            .then(data => setSlogan(data.content))
            .catch(error => console.error("Lỗi khi tải slogan:", error));
    }, []);

    return (
        <div className="slogan-container">
            <h2>{slogan}</h2>
        </div>
    );
};

export default SloganComponent;