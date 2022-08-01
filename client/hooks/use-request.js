import { useState } from "react";

const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null)

    const doRequest = async (props = {}) => {
        setErrors(null)
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...body, ...props })
        })

        const resJSON = await response.json();

        if (response.ok) {
            if (onSuccess) {
                onSuccess(resJSON);
            }
            return resJSON;
        } else {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oops...</h4>
                    <ul className="my-0">
                        {resJSON.errors.map(err => (
                            <li key={err.message}>{err.message}</li>
                        ))}
                    </ul>
                </div>
            );
        };
    };

    return { doRequest, errors };
};

export default useRequest;