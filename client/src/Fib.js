import React, { Component } from "react";
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  };

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({ seenIndexes: seenIndexes.data });
  }

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  componentDidUpdate() {
    console.log('component did update??');
  }

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(', ');
  }

  renderValues() {
    const entries = [];
    for (let key in this.state.values) {
      entries.push(
        <div key={key}> For index {key} I calculated {this.state.values[key]}</div>
      )
    }
    return entries;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handle submit...');
    const resp = await axios.post('/api/values', {
      index: this.state.index
    });
    console.log('request resolved: ', resp);
    this.setState({ index: '' });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index: </label>
          <input
            value={this.state.index}
            onChange={e => this.setState({ index: e.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values:</h3>
        {this.renderValues()}
      </div>
    )
  }
}

export default Fib;