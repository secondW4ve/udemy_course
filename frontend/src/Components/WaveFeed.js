import React, { Component } from 'react';

import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import WaveView from './WaveView';
import Modal from './Modal';

class WaveFeed extends Component {

    state = {
        page:{
            content: []
        },
        isLoadingWaves: false,
        newWaveCount: 0,
        isLoadingOldWaves: false,
        isLoadingNewWaves: false,
        modalVisible: false,
        waveToBeDeleted: undefined,
        isDeletingWave: false,
    }

    componentDidMount(){
        this.setState({isLoadingWaves: true})
        apiCalls.loadWaves(this.props.user)
            .then(response => {
                this.setState(
                    {page: response.data, isLoadingWaves: false},
                    () => {
                        this.counter = setInterval(this.checkCount, 3000);
                    }    
                );
            });
    }

    componentWillUnmount(){
        clearInterval(this.counter);
    }

    checkCount = () => {
        const waves = this.state.page.content;
        let topWaveId = 0;
        if (waves.length > 0){
            topWaveId = waves[0].id;
        }
        apiCalls.loadNewWaveCount(topWaveId, this.props.user)
            .then(response => {
                this.setState({newWaveCount: response.data.count})
            });
    }

    onClickLoadMore = () => {
        const waves = this.state.page.content;
        if (waves.length === 0){
            return;
        }
        const waveAtBottom = waves[waves.length - 1];
        this.setState({isLoadingOldWaves: true });
        apiCalls.loadOldWaves(waveAtBottom.id, this.props.user)
            .then(response => {
                const page = {...this.state.page};
                page.content = [...page.content, ...response.data.content];
                page.last = response.data.last;
                this.setState({page, isLoadingOldWaves: false});
            })
            .catch(error => {
                this.setState({isLoadingOldWaves: false});
            })
    }

    onClickLoadNew = () => {
        const waves = this.state.page.content;
        let topWaveId = 0;
        if (waves.length > 0){
            topWaveId = waves[0].id;
        }
        this.setState({isLoadingNewWaves: true})
        apiCalls.loadNewWaves(topWaveId, this.props.user)
            .then(response => {
                const page = {...this.state.page};
                page.content = [...response.data, ...page.content]
                this.setState({ page, newWaveCount: 0, isLoadingNewWaves: false})
            })
            .catch(error => {
                this.setState({isLoadingNewWaves: false});
            })
    }

    onClickDeleteWave = (wave) => {
        this.setState({ waveToBeDeleted: wave });
    }

    onClickModalCancel = () => {
        this.setState({ waveToBeDeleted: undefined });
    }

    onClickModalOk = () => {
        this.setState({isDeletingWave: true});
        apiCalls.deleteWave(this.state.waveToBeDeleted.id)
            .then(response => {
                const page = {...this.state.page};
                page.content = page.content.filter(wave => wave.id !== this.state.waveToBeDeleted.id);
                this.setState({ waveToBeDeleted: undefined, page, isDeletingWave: false });
            })
            .catch(error => {
                this.setState({isDeletingWave: false})
            })
    }

    render() {
        if (this.state.isLoadingWaves){
            return (<Spinner/>);
        }
        if (this.state.page.content.length === 0 && this.state.newWaveCount === 0){
            return (
                <div className = "card card-header text-center">
                    There are no waves
                </div>
            );
        } 
        const newWaveCountMessage = this.state.newWaveCount === 1 
        ? 'There is 1 new wave' 
        : `There are ${this.state.newWaveCount} new waves`
        return <div>
            {this.state.newWaveCount > 0 && (
                <div 
                    className = "card card-header text-center"
                    onClick = {!this.state.isLoadingNewWaves && this.onClickLoadNew}
                    style = {{cursor: this.state.isLoadingNewWaves ? 'not-allowed' : 'pointer'}}
                >
                    {this.state.isLoadingNewWaves ? <Spinner/> : newWaveCountMessage }
                    {}
                </div>
            )}
            {this.state.page.content.map((wave) => {
                return <WaveView key = {wave.id} wave = {wave} onClickDelete = {() => this.onClickDeleteWave(wave)}/>
            })}
            {this.state.page.last === false && (
                <div 
                    className = "card card-header text-center"
                    onClick = {!this.state.isLoadingOldWaves && this.onClickLoadMore}
                    style = {{cursor: this.state.isLoadingOldWaves ? 'not-allowed' : 'pointer'}}
                >
                    {this.state.isLoadingOldWaves ? <Spinner/> : 'Load More'}
                </div>
            )}
            <Modal 
                visible = {this.state.waveToBeDeleted && true}
                onClickCancel = {this.onClickModalCancel}
                body = {
                    this.state.waveToBeDeleted && 
                    `Are you sure you want to extinguish '${this.state.waveToBeDeleted.content}'?`
                }
                title = "Extinguish!"
                okButton = "Extinguish Wave"
                onClickOk = {this.onClickModalOk}
                pendingApiCall = {this.state.isDeletingWave}
            />
        </div>
    }
}

export default WaveFeed;