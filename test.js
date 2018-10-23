class A {

  handleClick() {
    console.log(this);
  }

  render() {
    return(
      <div onClick={this.handleClick}>clicl</div>
    )
  }
};

const lizi = new A();
const a = {};
a.handleClick = lizi.handleClick;
a.handleClick()

