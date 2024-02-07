import React from 'react'
import ir from '../ir.svg'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
const options = [
  {
    type: 'group',
    name: 'Mobilenet v2 Model',
    items: [
      {
        value: 'mobilenetv2',
        label: '90% Accurate - 2.6MB',
      },
      {
        value: 'mobilenetMid',
        label: '93% Accurate - 4.2MB',
      },
    ],
  },
  {
    type: 'group',
    name: 'Inception v3 Model',
    items: [
      {
        value: 'inceptionv3',
        label: '93% Accurate - Huge!',
      },
    ],
  },
]

const Footer = (props) => (
  <div>
    <div className="modelPicker">
      <p>Currently Using:</p>
      <Dropdown
        options={options}
        onChange={props.onChange}
        value={props.value}
      />
    </div>
    <footer>
      <div>Copyright 2024 Infinite Red, Inc.</div>
      <div>
        <a href="https://github.com/infinitered/nsfwjs">NSFW.js Github</a>
      </div>
      <div>
        <a href="https://github.com/infinitered/nsfwjs/tree/master/examples/nsfw_demo">Website Github</a>
      </div>
      <div>
        <a href="https://github.com/gantman/nsfw_model">NSFW Model Github</a>
      </div>
      <div>
        <a href="https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1">
          Blog Post
        </a>
      </div>
      <div>
        <a href="https://github.com/infinitered/nsfwjs-mobile">Mobile Demo Github</a>
      </div>
      <div>
        <a href="https://infinite.red">
          <img src={ir} alt="infinite red logo" />
        </a>
      </div>
    </footer>
  </div>
)

export default Footer
