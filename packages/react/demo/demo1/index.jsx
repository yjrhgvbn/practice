import React from '../../src'
import './index.css'

function onClick() {
  // eslint-disable-next-line no-alert
  alert('hello world')
}
const style = {
  color: 'red',
}

function app() {
  return <div className={'test'} onClick={onClick} style={style}>
    hello world
</div>
}

React.render(
  app,
  document.getElementById('root'),
)
