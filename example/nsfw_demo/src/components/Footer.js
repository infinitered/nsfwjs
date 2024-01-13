import React from 'react'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import ir from '../ir.svg'
const options = [
  {
    type: 'group',
    name: 'Mobilenet v2 Model',
    items: [
      {
        value: 'MobileNetV2',
        label: '90% Accurate - 2.6MB',
      },
      {
        value: 'MobileNetV2Mid',
        label: '93% Accurate - 4.2MB',
      },
    ],
  },
  {
    type: 'group',
    name: 'Inception v3 Model',
    items: [
      {
        value: 'InceptionV3',
        label: '93% Accurate - Huge!',
      },
    ],
  },
]

export default (props) => (
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
      <div>Copyright Now(ish)</div>
      <div>
        <a href="https://store.infinite.red/products/nsfw-js-black-shirt">
          Buy the Shirt
        </a>
      </div>
      <div>
        <a href="https://github.com/infinitered/nsfwjs">NSFWJS GitHub</a>
      </div>
      <div>
        <a href="https://github.com/gantman/nsfw_model">Model Repo</a>
      </div>
      <div>
        <a href="https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1">
          Blog Post
        </a>
      </div>
      <div>
        <a href="https://github.com/infinitered/nsfwjs-mobile">Mobile Demo</a>
      </div>
      <div>
        <a href="https://infinite.red">
          <img src={ir} alt="infinite red logo" />
        </a>
      </div>
    </footer>
  </div>
)
