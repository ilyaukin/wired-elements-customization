wired-elements customization
===
frontend components for [my-handicapped-pet-pet.io](http://my-handicapped-pet.io/).
It's customization of [wired-elements](https://github.com/rough-stuff/wired-elements).

### commands
after cloning<br>
`npm i`<br>
`lerna bootstrap`<br>
`npm run build`

run demo app on http://localhost:3000 <br>
`npm run start`

run component tests<br>
`npm run test`

to add new component<br>
`lerna create @my-handicapped-pet/wired-new-comp packages/wired-new-comp`

to publish version<br>
`lerna publish`

### todo<br>

* pull changes from the original repo (how? patch? is there any easier way?)

* consider merge component and frontend repo
  * app as one of packages??
  * then how to deal with `publish` etc.?

* consider add and publish demo app (page)
