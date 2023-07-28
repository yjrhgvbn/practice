import React from '../../src'
import './index.css'

function onClick() {
  alert('hello world')
}
const style = {
  color: 'red',
}

const app = <div className={'test'} onClick={onClick} style={style}>
    hello world
</div>

React.render(
  app,
  document.getElementById('root'),
)
