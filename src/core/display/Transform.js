import { Point, ObservablePoint } from '../math';
import TransformBase from './TransformBase';

/**
 * Generic class to deal with traditional 2D matrix transforms
 * local transformation is calculated from position,scale,skew and rotation
 *
 * @class
 * @extends PIXI.TransformBase
 * @memberof PIXI
 */
export default class Transform extends TransformBase
{
    /**
     *
     */
    constructor()
    {
        super();

         /**
         * The coordinate of the object relative to the local coordinates of the parent.
         *
         * @member {PIXI.Point}
         */
        this.position = new Point(0, 0);

        /**
         * The scale factor of the object.
         *
         * @member {PIXI.Point}
         */
        this.scale = new Point(1, 1);

        /**
         * The skew amount, on the x and y axis.
         *
         * @member {PIXI.ObservablePoint}
         */
        this.skew = new ObservablePoint(this.updateSkew, this, 0, 0);

        /**
         * The pivot point of the displayObject that it rotates around
         *
         * @member {PIXI.Point}
         */
        this.pivot = new Point(0, 0);

        /**
         * The rotation value of the object, in radians
         *
         * @member {Number}
         * @private
         */
        this._rotation = 0;

        this._cx = 1; // cos rotation + skewY;
        this._sx = 0; // sin rotation + skewY;
        this._cy = 0; // cos rotation + Math.PI/2 - skewX;
        this._sy = 1; // sin rotation + Math.PI/2 - skewX;
    }

    /**
     * Updates the skew values when the skew or rotation changes.
     *
     * @private
     */
    updateSkew()
    {
        this._cx = Math.cos(this._rotation + this.skew._y);
        this._sx = Math.sin(this._rotation + this.skew._y);
        this._cy = -Math.sin(this._rotation - this.skew._x); // cos, added PI/2
        this._sy = Math.cos(this._rotation - this.skew._x); // sin, added PI/2
    }

    /**
     * Updates only local matrix
     */
    updateLocalTransform()
    {
        const lt = this.localTransform;

        lt.a = this._cx * this.scale._x;
        lt.b = this._sx * this.scale._x;
        lt.c = this._cy * this.scale._y;
        lt.d = this._sy * this.scale._y;

        lt.tx = this.position._x - ((this.pivot._x * lt.a) + (this.pivot._y * lt.c));
        lt.ty = this.position._y - ((this.pivot._x * lt.b) + (this.pivot._y * lt.d));
    }

    /**
     * Updates the values of the object and applies the parent's transform.
     *
     * @param {PIXI.Transform} parentTransform - The transform of the parent of this object
     */
    updateTransform(parentTransform)
    {
        const pt = parentTransform.worldTransform;
        const wt = this.worldTransform;
        const lt = this.localTransform;

        lt.a = this._cx * this.scale._x;
        lt.b = this._sx * this.scale._x;
        lt.c = this._cy * this.scale._y;
        lt.d = this._sy * this.scale._y;

        lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
        lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));

        // concat the parent matrix with the objects transform.
        wt.a = (lt.a * pt.a) + (lt.b * pt.c);
        wt.b = (lt.a * pt.b) + (lt.b * pt.d);
        wt.c = (lt.c * pt.a) + (lt.d * pt.c);
        wt.d = (lt.c * pt.b) + (lt.d * pt.d);
        wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
        wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;

        this._worldID ++;
    }

    /**
     * Decomposes a matrix and sets the transforms properties based on it.
     *
     * @param {PIXI.Matrix} matrix - The matrix to decompose
     */
    setFromMatrix(matrix)
    {
        matrix.decompose(this);
    }

    /**
     * The rotation of the object in radians.
     *
     * @member {number}
     * @memberof PIXI.Transform#
     */
    get rotation()
    {
        return this._rotation;
    }

    /**
     * Set the rotation of the transform.
     *
     * @param {number} value - The value to set to.
     */
    set rotation(value)
    {
        this._rotation = value;
        this.updateSkew();
    }
}
