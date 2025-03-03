const ButtonWidget = ({uiSchema}) => {
    const value = uiSchema?.['ui:options']?.['value'];
    const onClick = uiSchema?.['ui:options']?.['onClick'];
    const btnClass = uiSchema?.['classNames'];

    return (
        <button type="button" className={btnClass} onClick={onClick}>
            {value || 'Click Me!'}
        </button>
    );
};

export default ButtonWidget;