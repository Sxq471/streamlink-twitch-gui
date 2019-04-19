import Component from "@ember/component";
import { attribute, className, classNames, layout, tagName } from "@ember-decorators/component";
import isFocused from "utils/is-focused";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "label" )
@classNames( "input-btn-component" )
export default class InputBtnComponent extends Component {
	static positionalParams = [ "label" ];

	@className
	checked = false;

	@className
	disabled = false;

	label;

	@attribute
	tabindex = 0;

	/**
	 * @param {KeyboardEvent} event
	 */
	keyDown( event ) {
		switch ( event.key ) {
			case "Escape":
				if ( isFocused( this.element ) ) {
					this.element.blur();
					return false;
				}
				return;

			case " ":
				if ( isFocused( this.element ) && !this.disabled ) {
					this.click();
					return false;
				}
				return;
		}
	}
}
