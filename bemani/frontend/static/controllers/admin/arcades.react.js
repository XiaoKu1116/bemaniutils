/*** @jsx React.DOM */

var card_management = React.createClass({
    getInitialState: function(props) {
        return {
            new_arcade: {
                name: '',
                description: '',
                paseli_enabled: window.paseli_enabled,
                paseli_infinite: window.paseli_infinite,
                mask_services_url: window.mask_services_url,
                owners: [null],
            },
            arcades: window.arcades,
            usernames: window.usernames,
            editing_arcade: null,
        };
    },

    componentDidUpdate: function() {
        if (this.focus_element && this.focus_element != this.already_focused) {
            this.focus_element.focus();
            this.already_focused = this.focus_element;
        }
    },

    addNewArcade: function(event) {
        AJAX.post(
            Link.get('addarcade'),
            {arcade: this.state.new_arcade},
            function(response) {
                this.setState({
                    arcades: response.arcades,
                    new_arcade: {
                        name: '',
                        description: '',
                        paseli_enabled: window.paseli_enabled,
                        paseli_infinite: window.paseli_infinite,
                        mask_services_url: window.mask_services_url,
                        owners: [null],
                    },
                });
            }.bind(this)
        );
        event.preventDefault();
    },

    saveArcade: function(event) {
        AJAX.post(
            Link.get('updatearcade'),
            {arcade: this.state.editing_arcade},
            function(response) {
                this.setState({
                    arcades: response.arcades,
                    editing_arcade: null,
                });
            }.bind(this)
        );
        event.preventDefault();
    },

    deleteExistingArcade: function(event, arcadeid) {
        $.confirm({
            escapeKey: 'Cancel',
            animation: 'none',
            closeAnimation: 'none',
            title: 'Delete Arcade',
            content: 'Are you sure you want to delete this arcade from the network?',
            buttons: {
                Delete: {
                    btnClass: 'delete',
                    action: function() {
                        AJAX.post(
                            Link.get('removearcade'),
                            {arcadeid: arcadeid},
                            function(response) {
                                this.setState({
                                    arcades: response.arcades,
                                });
                            }.bind(this)
                        );
                    }.bind(this),
                },
                Cancel: function() {
                },
            }
        });
        event.preventDefault();
    },

    renderEditButton: function(arcade) {
        if(this.state.editing_arcade) {
            if (this.state.editing_arcade.id == arcade.id) {
                return (
                    <span>
                        <input
                            type="submit"
                            value="save"
                        />
                        <input
                            type="button"
                            value="cancel"
                            onClick={function(event) {
                                this.setState({
                                    editing_arcade: null,
                                });
                            }.bind(this)}
                        />
                    </span>
                );
            } else {
                return <span></span>;
            }
        } else {
            return (
                <span>
                    <Edit
                        onClick={function(event) {
                            var editing_arcade = null;
                            this.state.arcades.map(function(a) {
                                if (a.id == arcade.id) {
                                    editing_arcade = jQuery.extend(true, {}, a);
                                    editing_arcade.owners.push(null);
                                }
                            });
                            this.setState({
                                editing_arcade: editing_arcade,
                            });
                        }.bind(this)}
                    />
                    <br/>
                    <Delete
                        onClick={function(event) {
                            this.deleteExistingArcade(event, arcade.id);
                        }.bind(this)}
                    />
                </span>
            );
        }
    },

    renderName: function(arcade) {
        if (this.state.editing_arcade && arcade.id == this.state.editing_arcade.id) {
            return <input
                name="name"
                type="text"
                autofocus="true"
                ref={c => (this.focus_element = c)}
                value={ this.state.editing_arcade.name }
                onChange={function(event) {
                    var arcade = this.state.editing_arcade;
                    arcade.name = event.target.value;
                    this.setState({
                        editing_arcade: arcade,
                    });
                }.bind(this)}
            />;
        } else {
            return <span>{ arcade.name }</span>;
        }
    },

    sortName: function(a, b) {
        return a.name.localeCompare(b.name);
    },

    renderDescription: function(arcade) {
        if (this.state.editing_arcade && arcade.id == this.state.editing_arcade.id) {
            return <input
                name="description"
                type="text"
                value={ this.state.editing_arcade.description }
                onChange={function(event) {
                    var arcade = this.state.editing_arcade;
                    arcade.description = event.target.value;
                    this.setState({
                        editing_arcade: arcade,
                    });
                }.bind(this)}
            />;
        } else {
            return <span>{ arcade.description }</span>;
        }
    },

    sortDescription: function(a, b) {
        return a.description.localeCompare(b.description);
    },

    renderOwners: function(arcade) {
        if (this.state.editing_arcade && arcade.id == this.state.editing_arcade.id) {
            return this.state.editing_arcade.owners.map(function(owner, index) {
                return (
                    <div>
                        <SelectUser
                            name="owner"
                            key={index}
                            value={ this.state.editing_arcade.owners[index] }
                            usernames={ this.state.usernames }
                            onChange={function(owner) {
                                var arcade = this.state.editing_arcade;
                                if (owner) {
                                    /* Update the owner */
                                    arcade.owners[index] = owner;
                                    if (arcade.owners[arcade.owners.length - 1]) {
                                        arcade.owners.push(null);
                                    }
                                } else {
                                    /* We should kill this if there is more
                                       than one owner. */
                                    if (arcade.owners.length > 1) {
                                        arcade.owners.splice(index, 1);
                                    } else {
                                        arcade.owners[index] = null;
                                    }
                                }
                                this.setState({
                                    editing_arcade: arcade,
                                });
                            }.bind(this)}
                        />
                    </div>
                );
            }.bind(this))
        } else {
            return (
                (arcade.owners.length > 0) ?
                    <ul className="ownerlist">{
                        arcade.owners.map(function(owner) {
                            return <li>{ owner }</li>;
                        }.bind(this))
                    }</ul> :
                    <span className="placeholder">nobody</span>
            );
        }
    },

    renderPaseliEnabled: function(arcade) {
        if (this.state.editing_arcade && arcade.id == this.state.editing_arcade.id) {
            return <input
                name="paseli_enabled"
                type="checkbox"
                checked={ this.state.editing_arcade.paseli_enabled }
                onChange={function(event) {
                    var arcade = this.state.editing_arcade;
                    arcade.paseli_enabled = event.target.checked;
                    this.setState({
                        editing_arcade: arcade,
                    });
                }.bind(this)}
            />;
        } else {
            return <span>{ arcade.paseli_enabled ? "yes" : "no"  }</span>;
        }
    },

    renderPaseliInfinite: function(arcade) {
        if (this.state.editing_arcade && arcade.id == this.state.editing_arcade.id) {
            return <input
                name="paseli_infinite"
                type="checkbox"
                checked={ this.state.editing_arcade.paseli_infinite }
                onChange={function(event) {
                    var arcade = this.state.editing_arcade;
                    arcade.paseli_infinite = event.target.checked;
                    this.setState({
                        editing_arcade: arcade,
                    });
                }.bind(this)}
            />;
        } else {
            return <span>{ arcade.paseli_infinite ? "yes" : "no"  }</span>;
        }
    },

    renderMaskServicesURL: function(arcade) {
        if (this.state.editing_arcade && arcade.id == this.state.editing_arcade.id) {
            return <input
                name="mask_services_url"
                type="checkbox"
                checked={ this.state.editing_arcade.mask_services_url }
                onChange={function(event) {
                    var arcade = this.state.editing_arcade;
                    arcade.mask_services_url = event.target.checked;
                    this.setState({
                        editing_arcade: arcade,
                    });
                }.bind(this)}
            />;
        } else {
            return <span>{ arcade.mask_services_url ? "yes" : "no"  }</span>;
        }
    },

    render: function() {
        return (
            <div>
                <section>
                    <h3>Arcade List</h3>
                    <form className="inline" onSubmit={this.saveArcade}>
                        <Table
                            className="alt"
                            columns={[
                                {
                                    name: 'Name',
                                    render: this.renderName,
                                    sort: this.sortName,
                                },
                                {
                                    name: 'Description',
                                    render: this.renderDescription,
                                    sort: this.sortDescription,
                                },
                                {
                                    name: 'Owners',
                                    render: this.renderOwners,
                                },
                                {
                                    name: 'PASELI',
                                    render: this.renderPaseliEnabled,
                                },
                                {
                                    name: 'Infinite P',
                                    render: this.renderPaseliInfinite,
                                },
                                {
                                    name: 'Mask Web Addr',
                                    render: this.renderMaskServicesURL,
                                },
                                {
                                    name: 'Actions',
                                    render: this.renderEditButton,
                                    action: true,
                                },
                            ]}
                            rows={this.state.arcades}
                            emptymessage="There are no arcades on this network."
                        />
                    </form>
                </section>
                <hr/>
                <section>
                    <h3>Add Arcade</h3>
                    <form className="inline" onSubmit={this.addNewArcade}>
                    <div className="field">
                        <span>
                            <input
                                name="paseli_enabled"
                                type="checkbox"
                                id="paseli_enabled"
                                checked={ this.state.new_arcade.paseli_enabled }
                                onChange={function(event) {
                                    var arcade = this.state.new_arcade;
                                    arcade.paseli_enabled = event.target.checked;
                                    this.setState({
                                        new_arcade: arcade,
                                    });
                                }.bind(this)}
                            />
                            <label htmlFor="paseli_enabled">PASERI Enabled</label>
                            <input
                                name="paseli_infinite"
                                type="checkbox"
                                id="paseli_infinite"
                                checked={ this.state.new_arcade.paseli_infinite }
                                onChange={function(event) {
                                    var arcade = this.state.new_arcade;
                                    arcade.paseli_infinite = event.target.checked;
                                    this.setState({
                                        new_arcade: arcade,
                                    });
                                }.bind(this)}
                            />
                            <label htmlFor="paseli_infinite">Infinite PASELI Enabled</label>
                            <input
                                name="mask_services_url"
                                type="checkbox"
                                id="mask_services_url"
                                checked={ this.state.new_arcade.mask_services_url }
                                onChange={function(event) {
                                    var arcade = this.state.new_arcade;
                                    arcade.mask_services_url = event.target.checked;
                                    this.setState({
                                        new_arcade: arcade,
                                    });
                                }.bind(this)}
                            />
                            <label htmlFor="mask_services_url">Masks Service URL</label>
                        </span>
                        </div>
                        <div className="fields">
                            <div className="field half">
                            <input name="name" type="text" value={ this.state.new_arcade.name } placeholder="Arcade Name"
                                onChange={function(event) {
                                    var arcade = this.state.new_arcade;
                                    arcade.name = event.target.value;
                                    this.setState({new_arcade: arcade});
                                }.bind(this)} 
                            />
                            </div>
                            <div className="field half">
                                <input name="description" type="text" value={ this.state.new_arcade.description } placeholder="Arcade Description"
                                    onChange={function(event) {
                                        var arcade = this.state.new_arcade;
                                        arcade.description = event.target.value;
                                        this.setState({new_arcade: arcade});
                                    }.bind(this)}
                                />
                            </div>
                        </div>
                        <div className="field">
                            Owners:
                            {
                                this.state.new_arcade.owners.map(function(owner, index) {
                                    return (
                                        <div className="inner">
                                            <SelectUser
                                                name="owner"
                                                key={index}
                                                value={ this.state.new_arcade.owners[index] }
                                                usernames={ this.state.usernames }
                                                onChange={function(owner) {
                                                    var arcade = this.state.new_arcade;
                                                    if (owner) {
                                                        /* Update the owner */
                                                        arcade.owners[index] = owner;
                                                        if (arcade.owners[arcade.owners.length - 1]) {
                                                            arcade.owners.push(null);
                                                        }
                                                    } else {
                                                        /* We should kill this if there is more
                                                            than one owner. */
                                                        if (arcade.owners.length > 1) {
                                                            arcade.owners.splice(index, 1);
                                                        } else {
                                                            arcade.owners[index] = null;
                                                        }
                                                    }
                                                    this.setState({
                                                        new_arcade: arcade,
                                                    });
                                                }.bind(this)}
                                            />
                                        </div>
                                    );
                                }.bind(this))
                            }
                        </div>
                        <br/>
                        <input type="submit" value="save" className="primary"/>
                    </form>
                </section>
            </div>
        );
    },
});

ReactDOM.render(
    React.createElement(card_management, null),
    document.getElementById('content')
);
