import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';

const {width, height} = Dimensions.get('window');
const API_KEY = '84d2ed22179bdd753f4a7987ff9a147e';
const limit = 20;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      name: '',
      typing: false,
      typingTimeout: 5000,
      refreshing: false,
      page:1,
      finished: false,
    }
    
  }

  componentDidMount() {
    this.getData()
  }

  getData = async (text = '') => {
    const self = this;
    const url = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key='+API_KEY+'&gallery_id=66911286-72157647277042064&format=json&nojsoncallback=1&per_page='+limit+"&page="+this.state.page+"&text="+this.state.name
    console.log("url: ",url)
    await fetch(url)
    .then( response => {
      return response.json()
    })
    .then(items => {
      console.log("items: ",items)
      if(!items.photos.photo.length) {
        self.setState({finished: true})
      }
      else if(text) {
        self.setState({items:items.photos.photo})
      }
      else {
        self.setState({items:self.state.items.concat(items.photos.photo)})
      }
    })
    .catch(error => {
      console.log("error: ",error)
    })
  }

  

  changeName = (text) => {    
    if (this.state.typingTimeout) {
       clearTimeout(this.state.typingTimeout);
    }
    this.setState({
       name: text,
       typing: false,
       page:1,
       typingTimeout: setTimeout(() => {
          this.getData(text)
         }, 2000)
    });
  }

  renderItem = ({item, index}) => {
    return(
        <Image 
          source={{uri: "http://farm"+`${item.farm}.staticflickr.com/${item.server}/${item.id}_${item.secret}.jpg`}}
          style={styles.image}
        />
      )
  }

  endReached = () => {
    console.log("endReached called")
    this.setState({
      page: this.state.page+1
    },() => {
      this.getData()
    })
    
  }

  header = () => {
    return (
      <TextInput
          value={this.state.name}
          style={styles.input}
          placeholder="Search"
          onChangeText={(text) => this.changeName(text)}
        />
    )
  }

  footer = () => {
    if(this.state.finished) return null;
    return <ActivityIndicator />
  }

  render() {
    return (
      <View style={styles.container}>
          
          <FlatList
            data={this.state.items}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}`}
            ListHeaderComponent={this.header}
            refreshing={this.state.refreshing}
            onRefresh={() => this.getData()}
            numColumns={3}
            onEndReached={this.endReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={this.footer}
          />
      </View>
    )  
  }
};

const size = width/3-20;

const styles = StyleSheet.create({
  container: {padding:5},
  input: {borderBottomWidth:1, marginBottom:10, marginLeft:10,},
  image: {width:size, height: size, margin:10}
});

export default App;
