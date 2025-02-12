import React from 'react'

export default function MainTemplate(props) {
  const { schema, content, onSubmit, onReset, submitBtnOptions, resetBtnOptions } = props
  const submitBtnClass = submitBtnOptions?.props?.className || submitBtnOptions?.props?.classNames || 'primaryButton'
  const hidden = submitBtnOptions?.hide || false

  const resetBtnClass = resetBtnOptions?.props?.className || resetBtnOptions?.props?.classNames || 'primaryButton'
  const showClear = resetBtnOptions?.show || false

  return (
    <div className="d-flex flex-column">
      {(schema.title || schema.description) && (
        <header className="mb-2">
          <h3>{schema.title}</h3>
          <p style={{ fontSize: '15px', fontStyle: 'normal', fontWeight: 'normal' }}>
            {schema.description}
          </p>
        </header>
      )}
      <form
        onSubmit={onSubmit}
        onReset={onReset}
        className="d-flex flex-column p-1 align-items-center justify-content-center needs-validation"
        style={{ overflow: 'auto' }}
      >
        {content}
        <div className={`mt-3 ${showClear ? 'd-flex gap-3' : 'd-flex justify-content-center'}`}>
          <button
            type="submit"
            className={`${hidden ? 'invisible' : 'visible'} btn ${submitBtnClass}`}
            disabled={submitBtnOptions?.props?.disabled}
          >
            {submitBtnOptions?.submitText || 'Submit'}
          </button>
          {showClear && (
            <button
              type="reset"
              className={`btn ${resetBtnClass}`}
              disabled={resetBtnOptions?.props?.disabled}
            >
              {resetBtnOptions?.clearText || 'Clear'}
            </button>
          )}
        </div>
      </form>
      {schema.footerContent && <footer className="mt-3 text-center">{schema.footerContent}</footer>}
    </div>
  )
}
