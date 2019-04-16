import { get, set, computed } from "@ember/object";
import { alias, equal, notEmpty, or } from "@ember/object/computed";
import { on } from "@ember/object/evented";
import { cancel, later } from "@ember/runloop";
import ListItemComponent from "../-list-item/component";
import {
	ATTR_STREAMS_INFO_GAME,
	ATTR_STREAMS_INFO_TITLE
} from "data/models/settings/streams/fragment";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	layout,

	classNameBindings: [
		":stream-item-component",
		"showGame:show-game",
		"host:show-host",
		"settings.streams.show_flag:show-flag",
		"settings.streams.show_info:show-info",
		"infoGame:info-game",
		"infoTitle:info-title",
		"isFaded:faded",
		"expanded:expanded"
	],

	channel: alias( "content.channel" ),

	expanded: false,
	locked  : false,
	timer   : null,

	showGame: notEmpty( "channel.game" ),

	infoGame: equal( "settings.streams.info", ATTR_STREAMS_INFO_GAME ),
	infoTitle: equal( "settings.streams.info", ATTR_STREAMS_INFO_TITLE ),


	isFaded: or( "faded", "fadedVodcast" ),

	fadedVodcast: false,
	_fadedVodcast: computed(
		"content.isVodcast",
		"settings.content.streams.filter_vodcast",
		function() {
			return this.fadedVodcast
				|| this.content.isVodcast
				&& this.settings.content.streams.filter_vodcast;
		}
	),

	faded: false,
	_faded: computed(
		"settings.content.streams.filter_languages",
		"settings.content.streams.languages",
		"settings.content.hasStreamsLanguagesSelection",
		"channel.language",
		"channel.broadcaster_language",
		function() {
			if ( this.faded ) {
				return true;
			}

			if ( this.settings.content.streams.filter_languages ) {
				return false;
			}

			// don't fade if the user has selected none or all languages
			const hasLangSelection = this.settings.content.hasStreamsLanguagesSelection;
			if ( !hasLangSelection ) {
				return false;
			}

			const languages = this.settings.content.streams.languages.toJSON();
			const clang = this.channel.language;
			const blang = this.channel.broadcaster_language;

			// a channel language needs to be set
			if ( clang ) {
				// fade out if
				// no broadcaster language is set and channel language is filtered out
				if ( !blang && languages[ clang ] === false ) {
					return true;
				}
				// OR broadcaster language is set and filtered out (ignore channel language)
				if ( blang && languages[ blang ] === false ) {
					return true;
				}
				// OR broadcaster language is set to "other"
				if ( blang === "other" ) {
					return true;
				}
			}

			return false;
		}
	),


	mouseLeave() {
		const expanded = get( this, "expanded" );
		const locked = get( this, "locked" );
		if ( !expanded || locked ) { return; }

		this.clearTimer();

		this.timer = later( this, function() {
			if ( get( this, "locked" ) ) { return; }
			set( this, "expanded", false );
		}, 1000 );
	},

	clearTimer: on( "willDestroyElement", "mouseEnter", function() {
		if ( this.timer ) {
			cancel( this.timer );
			this.timer = null;
		}
	}),


	actions: {
		collapse() {
			if ( !get( this, "expanded" ) || get( this, "locked" ) ) { return; }
			this.clearTimer();
			set( this, "expanded", false );
		},

		expand() {
			if ( get( this, "expanded" ) ) {
				this.toggleProperty( "locked" );
			} else {
				set( this, "expanded", true );
			}
		}
	}
});
