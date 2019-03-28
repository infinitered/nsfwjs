import React from 'react'
import ir from '../ir.svg'

export default () => (
  <footer>
    <div>Copyright Now(ish)</div>
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
      <a href="https://infinite.red">
        <img src={ir} alt="infinite red logo" />
      </a>
    </div>
  </footer>
)
