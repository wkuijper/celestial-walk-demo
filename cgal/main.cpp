
#include <iostream>
#include <iomanip>
#include <fstream>
#include <vector>
#include <set>
#include <algorithm>

#include <CGAL/Exact_predicates_inexact_constructions_kernel.h>
#include <CGAL/Delaunay_triangulation_2.h>
#include <CGAL/Triangulation_face_base_with_info_2.h>
#include <CGAL/point_generators_2.h>
#include <CGAL/Random.h>

#include "include/optional.hpp"

typedef CGAL::Exact_predicates_inexact_constructions_kernel Kernel;
typedef Kernel::Point_2 Point;

typedef CGAL::Triangulation_vertex_base_2<Kernel> VertexBase;
typedef CGAL::Triangulation_face_base_with_info_2<int, Kernel> FaceBase;
typedef CGAL::Triangulation_data_structure_2<VertexBase, FaceBase> TriangulationStructure;

typedef CGAL::Delaunay_triangulation_2<Kernel, TriangulationStructure> DelaunayTriangulation;
typedef DelaunayTriangulation::Face_handle Face;
typedef DelaunayTriangulation::Segment Segement;
typedef DelaunayTriangulation::Edge Edge;

typedef CGAL::Random_points_in_square_2<DelaunayTriangulation::Point> RandomPoints;
typedef CGAL::Counting_iterator<RandomPoints, DelaunayTriangulation::Point> PointsIterator;

#define PI 3.14159265358979323846

using namespace std;
using nonstd::nullopt;
using nonstd::optional;

static const string LOG_FOLDER("output");
static int D(44000);

class SVGLog
{
  private:
    std::ofstream f;

    string OPEN = R"(
        <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        html, body {
                            height: 95%;
                        }
                        #mesh-div {
                            height: 100%;
                            min-height: 100%;
                            display: flex;
                            flex-direction: column;
                            padding: 20pt;
                        }
                        #mesh-svg {
                            border:2px;
                            border-style: solid;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        .mesh-line {
                            stroke-width: 100;
                            stroke:rgb(200, 200, 200);
                        }
                        .path-face {
                            fill:rgba(100, 200, 100, 0.5);
                        }
                        #arrow {
                            stroke-width: 200;
                            stroke:rgb(0, 0, 200);
                        }
                        #arrow-head {
                            fill:rgb(0, 0, 200);
                        }
                    </style>
                </head>
                <body>
                    <div id="mesh-div">
                        <svg viewBox=")" +
                  to_string(0 - D) + " " + to_string(0 - D) + " " + to_string(D + D) + " " + to_string(D + D) +
                  R"(" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" version="1.1" id="mesh-svg">
                            <defs>
                                <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,6 L9,3 z" class="arrowhead"/>
                                </marker>
                            </defs>
                            <g transform="scale(1, -1) ">
                            )";
    string CLOSE = R"(
                            </g>
                            Sorry, your browser does not support inline SVG.
                        </svg>
                    </div>
                </body>
            </html>)";

  public:
    SVGLog(const string &filename)
    {
        f.open(filename, ios::trunc | ios::in);
        f << OPEN;
    }

    SVGLog() {}

    void setup(const DelaunayTriangulation &T)
    {
        for (auto edge = T.edges_begin(); edge != T.edges_end(); ++edge)
        {
            /*
            * The edge type.
            * The Edge(f,i) is edge common to faces f and f.neighbor(i).
            * It is also the edge joining the vertices vertex(cw(i)) and vertex(ccw(i)) of f.
            *
            * https://doc.cgal.org/latest/TDS_2/classTriangulationDataStructure__2.html#a35f5c887003a6d08b6cef13228c89bd6
            *
            * To iterate over finite edges:
            * https://stackoverflow.com/questions/4837179/getting-a-vertex-handle-from-an-edge-iterator
            */

            auto segment = T.segment(*edge);

            auto p = segment.source(),
                 q = segment.target();

            f
                << endl
                << "<line x1=\"" << p.x() << "\" y1=\"" << p.y() << "\""
                << "x2=\"" << q.x() << "\" y2=\"" << q.y() << "\""
                << " class=\"mesh-line\" />";
        }
    }

    void face(const Face &face)
    {
        auto
            a = face->vertex(0)->point(),
            b = face->vertex(1)->point(),
            c = face->vertex(2)->point();

        f << "<polygon points=\""
          << a.x() << ", " << a.y() << ", "
          << b.x() << ", " << b.y() << ", "
          << c.x() << ", " << c.y() << "\" "
          << " class = \"path-face\" />"
          << endl;
    }

    void circle(const Point &point, const string &color = "red", double r = 1)
    {
        f << "<circle "
          << "cx=\"" << point.x() << "\" cy=\"" << point.y() << "\" r=\"" << r << "\""
          << " fill=\"" << color << "\" />"
          << endl;
    }

    void arrow(const Point &origin, const Point &target)
    {
        f << "<line x1=\"" << origin.x() << "\" y1=\"" << origin.y() << "\""
          << " x2=\"" << target.x() << "\" y2=\"" << target.y() << "\""
          << " id=\"arrow\" marker-end=\"url(#arrow-head)\" />" << endl;
    }

    void line(const Point &origin, const Point &target)
    {
        f << "<line x1=\"" << origin.x() << "\" y1=\"" << origin.y() << "\""
          << " x2=\"" << target.x() << "\" y2=\"" << target.y() << "\""
          << " class=\"mesh-line\"/>" << endl;
    }

    void text(const Point &pos, const string &text, const string &style)
    {
        f << "<g transform=\"scale(1, -1)\">"
          << "<text x=\"" << pos.x() << "\" y=\"" << 0 - pos.y() << "\" style=\""
          << style << "\">" << text << "</text>"
          << "</g>" << endl;
    }

    void close()
    {
        f.close();
    }

    void flush()
    {
        f << std::flush;
    }
};

/**
 * Class providing an edge-like interface to a tringulation.
 * Rims are ccw wound.
 */
class Rim
{
  private:
    DelaunayTriangulation T;
    /*
     * The edge type
     * The Edge(f,i) is edge common to faces f and f.neighbor(i).
     * It is also the edge joining the vertices vertex(cw(i)) and vertex(ccw(i)) of f.
     * https://doc.cgal.org/latest/TDS_2/classTriangulationDataStructure__2.html#a35f5c887003a6d08b6cef13228c89bd6
     */
    Edge e;

  public:
    static Rim make(const Point &p, const DelaunayTriangulation &T)
    {
        // Select face containing the point.
        auto face = T.locate(p);

        // Select edge of the face such that it will connect verteces 0 and 1.
        return Rim(T, Edge(face, 2));
    }

    Rim(const DelaunayTriangulation &triangulation, const Edge &edge) : T(triangulation), e(edge) {}

    string to_string() const
    {
        auto i = e.second;
        auto p = origin(),
             q = target();

        return "[<" +
               std::to_string(e.first->ccw(i)) + ", " + std::to_string(e.first->cw(i)) + ">, (" +
               std::to_string(p.x()) + ", " + std::to_string(p.y()) +
               ") --> (" +
               std::to_string(q.x()) + ", " + std::to_string(q.y()) +
               ")]";
    }

    const Rim next() const
    {
        return Rim(T, Edge(e.first, e.first->ccw(e.second)));
    }

    const Rim prev() const
    {
        return Rim(T, Edge(e.first, e.first->cw(e.second)));
    }

    const Rim twin() const
    {
        return Rim(T, T.mirror_edge(e));
    }

    const Point &origin() const
    {
        auto v = e.first->ccw(e.second);
        return e.first->vertex(v)->point();
        // T.segment creates a local variable.
        // return T.segment(e).source();
    }

    const Point &target() const
    {
        auto v = e.first->cw(e.second);
        return e.first->vertex(v)->point();
    }

    const Face &face() const
    {
        return e.first;
    }

    bool operator==(const Rim &rim) const
    {
        return e == rim.e;
    }

    bool operator!=(const Rim &rim) const
    {
        return e != rim.e;
    }
};

ostream &operator<<(ostream &stream, const Rim &rim)
{
    return stream << rim.to_string();
}

double orient(const Point &p, const Point &q, const Point &r)
{
    return ((q.x() - p.x()) * (r.y() - p.y()) - (q.y() - p.y()) * (r.x() - p.x()));
}

bool strictlyRightOf(const Point &start, const Point &end, const Point &test)
{
    return orient(start, end, test) < 0;
}

bool leftOrOnTopOf(const Point &start, const Point &end, const Point &test)
{
    return orient(start, end, test) >= 0;
}

/**
 * Approximates a bisector between a given and the next edges.
 */
std::pair<Point, Point> computeApproxBisector(const Rim &rim)
{
    auto next = rim.next();
    auto outwards_perpendicular = (next.target() - rim.origin()).perpendicular(CGAL::RIGHT_TURN);
    return std::pair<Point, Point>(next.origin(), rim.origin() + outwards_perpendicular);
}

/**
 * Computes obtuseness of a triangle formed by a given and the next edges
 */
bool computeObtuseness(const Rim &rim)
{
    auto next = rim.next();
    auto inwards_perpedicular = (rim.target() - rim.origin()).perpendicular(CGAL::LEFT_TURN);
    return strictlyRightOf(rim.target(), rim.target() + inwards_perpedicular, next.target());
}

int celestial_walk(
    const Point &origin,
    const Point &target,
    const DelaunayTriangulation &T,
    optional<SVGLog> &walk_log)
{
    int tests(0);
    // Select an edge of the face that contains the origin;
    auto rim = Rim::make(origin, T);

    // Dedug code showing ccw-woundness of rims.
    // This should have been a test-code :(.
    // cout << rim << endl;
    // rim = rim.next();
    // cout << rim << endl;
    // rim = rim.next();
    // cout << rim << endl;

    // rim = rim.twin();
    // cout << endl
    //      << rim << endl;
    // rim = rim.next();
    // cout << rim << endl;
    // rim = rim.next();
    // cout << rim << endl;

    if (walk_log)
    {
        walk_log->arrow(rim.origin(), rim.target());
    }

    // Select an edge in the face such that the target point is on the left of it.
    if (++tests && strictlyRightOf(rim.origin(), rim.target(), target))
    {
        // Log the face we will leave.
        if (walk_log)
        {
            walk_log->face(rim.face());
        }
        // Twin is assumed to exist.
        rim = rim.twin();
    }

    if (walk_log)
    {
        walk_log->arrow(rim.origin(), rim.target());
    }
    auto rim2 = rim.next();

    if (walk_log)
    {
        walk_log->arrow(rim2.origin(), rim2.target());
    }

    int n = 0;
    while (rim != rim2 && n < 10000)
    {
        n++;

        if (walk_log)
        {
            walk_log->flush();
        }

        if (++tests && strictlyRightOf(rim2.origin(), rim2.target(), target))
        {
            auto approxBisector = computeApproxBisector(rim2);
            auto obtuse = computeObtuseness(rim2);
            while (obtuse && (++tests && leftOrOnTopOf(approxBisector.first, approxBisector.second, target)))
            {
                rim2 = rim2.next();

                if (walk_log)
                {
                    walk_log->arrow(rim2.origin(), rim2.target());
                }

                approxBisector = computeApproxBisector(rim2);
                obtuse = computeObtuseness(rim2);
            }

            if (walk_log)
            {
                walk_log->face(rim2.face());
            }

            // Twin is assumed to exist.
            rim = rim2.twin();

            if (walk_log)
            {
                walk_log->arrow(rim.origin(), rim.target());
            }

            rim2 = rim.next();

            if (walk_log)
            {
                walk_log->arrow(rim2.origin(), rim2.target());
            }
        }
        else
        {
            rim2 = rim2.next();

            if (walk_log)
            {
                walk_log->arrow(rim2.origin(), rim2.target());
            }
        }

        if (walk_log)
        {
            walk_log->face(rim2.face());
        }
    }

    return tests;
}

pair<double, double> mean_stdev(const vector<int> &v)
{
    double sum = accumulate(v.begin(), v.end(), 0.);
    double mean = sum / v.size();

    auto accumulator = [mean](int total, int v) { return total + (v - mean) * (v - mean); };
    double var = accumulate(v.begin(), v.end(), 0.0, accumulator) / v.size();

    return pair<double, double>(mean, sqrt(var));
}

int main(int argc, char *argv[])
{
    if (argc != 5)
    {
        cout << "main {triangulations} {points in triangulation} {direction change} {write logs (0 or 1)}" << endl;
        return 0;
    }
    // Create the log folder if does not exist and remove all logs.
    string c("mkdir -p " + LOG_FOLDER + " && rm -rf ./" + LOG_FOLDER + "/*");
    system(c.c_str());

    // Number of triangulations.
    int TRINAGULATIONS = atoi(argv[1]);
    // Number of points in trinagulation.
    int POINTS = atoi(argv[2]);
    // Every time the walking direction changes by step degrees.
    int step = atoi(argv[3]);
    bool log_it = atoi(argv[4]) == 1;

    // There is a vector of stats for each angle.
    vector<vector<int>> data(360 / step, vector<int>());

    // Always walk from the origin.
    Point origin(0.0, 0.0);
    // Describe extrem point of the surface to triangulate.
    set<Point> extrema{Point(-D, -D), Point(-D, D), Point(D, -D), Point(D, D)};

    int t = 0;
    while (t < TRINAGULATIONS)
    {
        // Generate a random Delaunay triangulation.
        DelaunayTriangulation DT;
        set<Point> points;
        CGAL::Random rnd;
        generate_n(inserter(points, points.begin()), POINTS, [&rnd]() {
            // 1 - D, so the left border is not included.
            return Point(rnd.get_int(1 - D, D), rnd.get_int(1 - D, D));
        });

        DT.insert(extrema.begin(), extrema.end());
        DT.insert(points.begin(), points.end());

        // Iterate over compass directions.
        for (int angle = 0; angle < 360; angle += step)
        {
            // SVGLog walk_log(LOG_FOLDER + "/triangulation_t(" + to_string(t) + ")_angle(" + to_string(angle) + ").html");
            optional<SVGLog> walk_log =
                log_it ? optional<SVGLog>(SVGLog(LOG_FOLDER + "/triangulation_t(" + to_string(t) + ")_angle(" + to_string(angle) + ").html")) : nullopt;

            if (walk_log)
            {
                // Setup the logger.
                walk_log->setup(DT);
                // Mark a reference point.
                walk_log->circle(Point(D, D), "green", 500);
                walk_log->flush();
            }

            // Fix direction.
            double r = 0.8 * D;
            Point target(r * cos(PI * angle / 180.), r * sin(PI * angle / 180.));

            // Perform the walk.
            int tests = celestial_walk(origin, target, DT, walk_log);
            data[angle / step].push_back(tests);

            if (walk_log)
            {
                walk_log->circle(origin, "blue", 500);
                walk_log->circle(target, "red", 500);
                walk_log->close();
            }
        }

        cout << (t + 1) << "/" << TRINAGULATIONS << endl;
        t++;
    }

    // Process stats.
    struct Statistic
    {
        int angle;
        double mean;
        double std_dev;
    };

    vector<Statistic> stats;

    auto angle = 0;
    auto d = mean_stdev(data[0]);
    double m(d.first), M(d.first);
    stats.push_back((Statistic){angle, d.first, d.second});

    for (auto i = 1; i < data.size(); ++i)
    {
        angle = step * i;
        d = mean_stdev(data[i]);
        stats.push_back((Statistic){angle, d.first, d.second});

        if (d.first < m)
        {
            m = d.first;
        }
        if (d.first > M)
        {
            M = d.first;
        }
    }

    // x-axis is going to be rescaled to angle values.
    auto x_scaler = [](double a) {
        // add a little space around by add 30 degree to ech side of [0, 360).
        // return 2 * D * (a - (-30)) / ((360 + 30) - (-30)) - D;
        return 2 * D * (a + 30) / 390 - D;
    };
    // y-axis is going to be rescaled to fit mean value.
    auto y_scaler = [&m, &M](double v) {
        // add a little space around by multiplying m and M.
        return 2 * D * (v - 0.9 * m) / (1.1 * M - 0.9 * m) - D;
    };

    SVGLog graph(LOG_FOLDER + "/graph.html");
    graph.text(Point(-D, y_scaler(m)), to_string(m), "font: bold 2000px sans-serif;");
    graph.text(Point(-D, y_scaler(M)), to_string(M), "font: bold 2000px sans-serif;");

    cout << endl
         << endl
         << setw(10) << "Angle"
         << " | " << setw(10) << "Mean"
         << " | " << setw(10) << "Std.Dev." << endl;
    for (auto i = 0; i < stats.size(); i++)
    {
        cout << setw(10) << stats[i].angle
             << " | " << setw(10) << stats[i].mean
             << " | " << setw(10) << stats[i].std_dev
             << endl;

        graph.line(
            Point(x_scaler(stats[i].angle), -D),
            Point(x_scaler(stats[i].angle), D));
        if (i % 2 == 0)
        {
            graph.text(
                Point(x_scaler(stats[i].angle), -D + 2000),
                to_string(stats[i].angle), "font: bold 2000px sans-serif;");
        }

        graph.circle(Point(x_scaler(stats[i].angle), y_scaler(stats[i].mean)), "green", 500);
    }

    graph.close();

    return 0;
}
