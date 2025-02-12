const ButtonWidget = ({uiFieldSchema}) => {
    const value = uiFieldSchema?.['ui:options']?.['value'];
    const onClick = uiFieldSchema?.['ui:options']?.['onClick'];
    const btnClass = uiFieldSchema?.['classNames'];

    return (
        <button type="button" className={btnClass} onClick={onClick}>
            {value || 'Click Me!'}
        </button>
    );
};

export default ButtonWidget;