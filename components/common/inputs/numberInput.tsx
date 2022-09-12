import styles from '../../../styles/input.module.css';
import { DetailedHTMLProps, Dispatch, InputHTMLAttributes, SetStateAction, useState } from "react";
import { useOverlay } from "../../../hooks/useOverlay";
import { numberInBetween } from "../../../utils/util";

interface NumberInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    setCallback: Dispatch<SetStateAction<number>>,
    initial?: number,
    min?: number,
    max?: number,
    msg?: string,
    immediately?: boolean
}

export const NumberInput = (props: NumberInputProps) => {
    const {
        setCallback,
        initial,
        placeholder,
        type = 'number',
        min,
        max,
        msg,
        className = '',
        immediately
    } = props;
    const [tempValue, setTempValue] = useState(initial);
    const { showToast } = useOverlay();
    
    const applyValue = (value?: number) => {
        if (tempValue === undefined) return;
        if (!numberInBetween(min, max, value || tempValue)) {
            showToast('정상적인 값이 아닙니다');
            return;
        }
        setCallback(value || tempValue);
    }

    return (
        <div className={styles.input_wrap}>
            <input
                {...props}
                className={`input ${className}`}
                type={type}
                value={tempValue}
                onChange={(event) => {
                    setTempValue(Number(event.target.value));
                    if (immediately) applyValue(Number(event.target.value));
                }}
                placeholder=''
                onBlur={() => applyValue()}
                onKeyDown={e => e.key === 'Enter' && applyValue()}
            ></input>
            <span>{msg}</span>
            <span className={styles.placeholder}>{placeholder}</span>
        </div>
    );
}