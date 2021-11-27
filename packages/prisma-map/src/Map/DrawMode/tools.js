/*
 * COPYRIGHT © 2018 OROLIA GROUP AND/OR ITS AFFILIATES. ALL RIGHTS ARE STRICTLY RESERVED.
 * THIS SOURCE CODE CONTAINS PROPRIETARY AND CONFIDENTIAL INFORMATION AND DATA AND IS THE
 * SOLE PROPERTY OF OROLIA GROUP AND/OR ITS AFFILIATES.
 * THIS SOURCE CODE MUST NOT BE USED, DISSEMINATED, OR DISTRIBUTED EXCEPT FOR THE AGREED PURPOSE.
 * UNAUTHORIZED USE, REPRODUCTION, OR ISSUE TO ANY THIRD PARTY IS NOT PERMITTED WITHOUT THE
 * PRIOR WRITTEN CONSENT OF THE OROLIA GROUP.
 * THIS SOURCE CODE IS TO BE RETURNED TO THE OROLIA GROUP WHEN THE AGREED PURPOSE IS FULFILLED.
 * -------------------------------------
 * Utilities for working with draw tools.
 *
 * For external API we simplify the draw modes to tools that are easier to work with.
 * This way, we separate the mapboxgl draw specifics from general draw tool actions.
 *
 * The conversions are as follows
 *
 * Mapbox GL Draw Mode  |  @prisma/map drawTool
 * ---------------------------------------------
 *    simple_select     |   select
 *    draw_point        |   point
 *    draw_line_string  |   line
 *    draw_polygon      |   polygon
 */

/**
 * Converts the mapboxgl draw mode to the prisma map draw tool.
 *
 * @param {string} mode MapboxDraw.getMode()
 * @return {string} drawTool string
 */
export function convertModeToTool(mode) {
  let tool = 'select';
  switch (mode) {
    case 'draw_point': {
      tool = 'point';
      break;
    }
    case 'draw_line_string': {
      tool = 'line';
      break;
    }
    case 'draw_polygon': {
      tool = 'polygon';
      break;
    }
    default: {
      tool = 'select';
      break;
    }
  }

  return tool;
}

/**
 * Converts the prisma map draw tool to the mapboxgl draw mode.
 *
 * @param {string} tool @prisma/map drawTool.
 * @return {string} MapboxDraw mode
 */
export function convertToolToMode(tool) {
  let mode = 'simple_select';

  switch (tool) {
    case 'point': {
      mode = 'draw_point';
      break;
    }
    case 'line': {
      mode = 'draw_line_string';
      break;
    }
    case 'polygon': {
      mode = 'draw_polygon';
      break;
    }
    default: {
      mode = 'simple_select';
    }
  }

  return mode;
}
