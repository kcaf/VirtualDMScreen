/*$.ui.draggable.prototype._generatePosition = function( event, constrainPosition ) {

    var containment, co, top, left,
      o = this.options,
      scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
      pageX = event.pageX,
      pageY = event.pageY;

    var scale = this.element.parent().data("scale") || 1;
    if(o.scale === true){
        pageY = this.originalPageY + ((pageY - this.originalPageY)*(1/scale));
        pageX = this.originalPageX + ((pageX - this.originalPageX)*(1/scale));
    }

    // Cache the scroll
    if ( !scrollIsRootNode || !this.offset.scroll ) {
      this.offset.scroll = {
        top: this.scrollParent.scrollTop(),
        left: this.scrollParent.scrollLeft()
      };
    }

     // - Position constraining -
     // Constrain the position to a mix of grid, containment.

    // If we are not dragging yet, we won't check for options
    if ( constrainPosition ) {
      if ( this.containment ) {
        if ( this.relativeContainer ) {
          co = this.relativeContainer.offset();
          containment = [
            this.containment[ 0 ] + co.left,
            this.containment[ 1 ] + co.top,
            this.containment[ 2 ] + co.left,
            this.containment[ 3 ] + co.top
          ];
        } else {
          containment = this.containment;
        }

        if ( event.pageX - this.offset.click.left < containment[ 0 ] ) {
          pageX = containment[ 0 ] + this.offset.click.left;
        }
        if ( event.pageY - this.offset.click.top < containment[ 1 ] ) {
          pageY = containment[ 1 ] + this.offset.click.top;
        }
        if ( event.pageX - this.offset.click.left > containment[ 2 ] ) {
          pageX = containment[ 2 ] + this.offset.click.left;
        }
        if ( event.pageY - this.offset.click.top > containment[ 3 ] ) {
          pageY = containment[ 3 ] + this.offset.click.top;
        }
      }

      if ( o.grid ) {

        //Check for grid elements set to 0 to prevent divide by 0 error causing invalid
        // argument errors in IE (see ticket #6950)
        top = o.grid[ 1 ] ? this.originalPageY + Math.round( ( pageY -
          this.originalPageY ) / o.grid[ 1 ] ) * o.grid[ 1 ] : this.originalPageY;
        pageY = containment ? ( ( top - this.offset.click.top >= containment[ 1 ] ||
          top - this.offset.click.top > containment[ 3 ] ) ?
            top :
            ( ( top - this.offset.click.top >= containment[ 1 ] ) ?
              top - o.grid[ 1 ] : top + o.grid[ 1 ] ) ) : top;

        left = o.grid[ 0 ] ? this.originalPageX +
          Math.round( ( pageX - this.originalPageX ) / o.grid[ 0 ] ) * o.grid[ 0 ] :
          this.originalPageX;
        pageX = containment ? ( ( left - this.offset.click.left >= containment[ 0 ] ||
          left - this.offset.click.left > containment[ 2 ] ) ?
            left :
            ( ( left - this.offset.click.left >= containment[ 0 ] ) ?
              left - o.grid[ 0 ] : left + o.grid[ 0 ] ) ) : left;
      }

      if ( o.axis === "y" ) {
        pageX = this.originalPageX;
      }

      if ( o.axis === "x" ) {
        pageY = this.originalPageY;
      }
    }

    return {
      top: (

        // The absolute mouse position
        pageY -

        // Click offset (relative to the element)
        this.offset.click.top -

        // Only for relative positioned nodes: Relative offset from element to offset parent
        this.offset.relative.top -

        // The offsetParent's offset without borders (offset + border)
        this.offset.parent.top +
        ( this.cssPosition === "fixed" ?
          -this.offset.scroll.top :
          ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
      ),
      left: (

        // The absolute mouse position
        pageX -

        // Click offset (relative to the element)
        this.offset.click.left -

        // Only for relative positioned nodes: Relative offset from element to offset parent
        this.offset.relative.left -

        // The offsetParent's offset without borders (offset + border)
        this.offset.parent.left +
        ( this.cssPosition === "fixed" ?
          -this.offset.scroll.left :
          ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
      )
    };

  }
  */
/*
$.ui.draggable.prototype._generatePosition = function(event) {
    var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
    var pageX = event.pageX;
    var pageY = event.pageY;
    //PATCH CODE
    var scale = this.element.parent().data("scale") || 1;
    if(o.scale === true){
        pageY = this.originalPageY + ((pageY - this.originalPageY)*(1/scale));
        pageX = this.originalPageX + ((pageX - this.originalPageX)*(1/scale));
    }
    //END
    /*
     * - Position constraining -
     * Constrain the position to a mix of grid, containment.
     */
/*
    if(this.originalPosition) { //If we are not dragging yet, we won't check for options

      if(this.containment) {
        if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
        if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
        if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
        if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
      }

      if(o.grid) {
        var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
        pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

        var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
        pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
      }
    }
    return {
      top: (
        pageY                               // The absolute mouse position
        - this.offset.click.top                         // Click offset (relative to the element)
        - this.offset.relative.top                        // Only for relative positioned nodes: Relative offset from element to offset parent
        - this.offset.parent.top                        // The offsetParent's offset without borders (offset + border)
        + ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) )
      ),
      left: (
        pageX                               // The absolute mouse position
        - this.offset.click.left                        // Click offset (relative to the element)
        - this.offset.relative.left                       // Only for relative positioned nodes: Relative offset from element to offset parent
        - this.offset.parent.left                       // The offsetParent's offset without borders (offset + border)
        + ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() )
      )
    };

  }
*/